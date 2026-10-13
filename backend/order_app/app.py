"""Order App: Flask JSON API, XML-RPC client, RabbitMQ publisher (fire-and-forget)."""
import json
import os
import random
import socket
import string
import time
from datetime import datetime, timezone
from xmlrpc.client import ServerProxy, Fault, ProtocolError

import pika
from flask import Flask, jsonify, request

app = Flask(__name__)

RABBIT_HOST = os.environ.get("RABBITMQ_HOST", "localhost")
RABBIT_USER = os.environ.get("RABBITMQ_USER", "guest")
RABBIT_PASS = os.environ.get("RABBITMQ_PASS", "guest")
PAYMENT_URL = os.environ.get("PAYMENT_URL", "http://localhost:8000")
EXCHANGE = "order_events"

ALLOWED_METHODS = {"qris", "gopay", "ovo", "dana", "shopeepay"}

# Katalog server = sumber kebenaran harga (FR-02). Hanya 4 game sesuai PRD.
CATALOG = {
    "ml": {
        "id": "ml",
        "name": "Mobile Legends: Bang Bang",
        "stock": 1000,
        "nominals": [
            {"id": "ml-1", "label": "86 Diamond", "amount": 19500},
            {"id": "ml-2", "label": "172 Diamond", "amount": 38000},
            {"id": "ml-3", "label": "257 Diamond", "amount": 56500},
            {"id": "ml-4", "label": "706 Diamond", "amount": 149000},
        ],
    },
    "ff": {
        "id": "ff",
        "name": "Free Fire MAX",
        "stock": 1000,
        "nominals": [
            {"id": "ff-1", "label": "100 Diamond", "amount": 14000},
            {"id": "ff-2", "label": "210 Diamond", "amount": 28000},
            {"id": "ff-3", "label": "530 Diamond", "amount": 68000},
            {"id": "ff-4", "label": "1080 Diamond", "amount": 135000},
        ],
    },
    "genshin": {
        "id": "genshin",
        "name": "Genshin Impact",
        "stock": 500,
        "nominals": [
            {"id": "gi-1", "label": "60 Crystal", "amount": 16000},
            {"id": "gi-2", "label": "330 Crystal", "amount": 75000},
            {"id": "gi-3", "label": "1090 Crystal", "amount": 240000},
            {"id": "gi-4", "label": "2240 Crystal", "amount": 479000},
        ],
    },
    "pubg": {
        "id": "pubg",
        "name": "PUBG Mobile",
        "stock": 800,
        "nominals": [
            {"id": "pubg-1", "label": "60 UC", "amount": 14500},
            {"id": "pubg-2", "label": "325 UC", "amount": 75000},
            {"id": "pubg-3", "label": "660 UC", "amount": 149000},
            {"id": "pubg-4", "label": "1800 UC", "amount": 379000},
        ],
    },
}

ORDERS: list[dict] = []


def make_order_id() -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "".join(random.choice(alphabet) for _ in range(8))


def find_nominal(game_id: str, nominal_id: str):
    game = CATALOG.get(game_id)
    if not game:
        return None, None
    for n in game["nominals"]:
        if n["id"] == nominal_id:
            return game, n
    return game, None


def publish_event(event: dict) -> bool:
    """Publish fire-and-forget ke fanout exchange. Return False bila RabbitMQ gagal."""
    try:
        creds = pika.PlainCredentials(RABBIT_USER, RABBIT_PASS)
        params = pika.ConnectionParameters(host=RABBIT_HOST, credentials=creds, socket_timeout=3)
        conn = pika.BlockingConnection(params)
        ch = conn.channel()
        ch.exchange_declare(exchange=EXCHANGE, exchange_type="fanout", durable=False)
        ch.basic_publish(exchange=EXCHANGE, routing_key="", body=json.dumps(event))
        conn.close()
        return True
    except Exception as e:  # noqa: BLE001 - sengaja: MQ gagal tak boleh menggagalkan order SUCCESS
        print(f"[order_app] publish gagal: {e}", flush=True)
        return False


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.get("/api/catalog")
def catalog():
    games = [
        {
            "id": g["id"],
            "name": g["name"],
            "stock": g["stock"],
            "nominals": g["nominals"],
        }
        for g in CATALOG.values()
    ]
    return jsonify({"games": games, "methods": sorted(ALLOWED_METHODS)})


@app.get("/api/orders")
def orders():
    return jsonify({"orders": list(reversed(ORDERS))})


@app.post("/api/topup")
def topup():
    data = request.get_json(silent=True) or {}
    game_id = str(data.get("game_id", "")).strip()
    nominal_id = str(data.get("nominal_id", "")).strip()
    player_id = str(data.get("player_id", "")).strip()
    metode = str(data.get("metode", "")).strip().lower()

    # FR-03: tolak input tak valid sebelum RPC.
    if not player_id:
        return jsonify({"error": "Player ID wajib diisi."}), 400
    game, nominal = find_nominal(game_id, nominal_id)
    if game is None:
        return jsonify({"error": "Game tidak dikenal."}), 400
    if nominal is None:
        return jsonify({"error": "Nominal tidak tersedia untuk game ini."}), 400
    if metode not in ALLOWED_METHODS:
        return jsonify({"error": "Metode pembayaran tidak didukung."}), 400

    amount = int(nominal["amount"])
    order_id = make_order_id()
    now = datetime.now(timezone.utc).isoformat()

    # Panggilan RPC sinkron — satu-satunya langkah yang membuat halaman menunggu.
    try:
        proxy = ServerProxy(PAYMENT_URL, allow_none=True)
        # Timeout eksplisit via socket default agar tak menggantung selamanya.
        old_timeout = socket.getdefaulttimeout()
        socket.setdefaulttimeout(8)
        try:
            result = proxy.validate_payment(order_id, amount, metode)
        finally:
            socket.setdefaulttimeout(old_timeout)
    except (Fault, ProtocolError, OSError, TimeoutError, Exception) as e:  # noqa: BLE001
        print(f"[order_app] payment RPC tak terjangkau: {e}", flush=True)
        order = {
            "order_id": order_id,
            "game": game["name"],
            "item": f"{game['name']} - {nominal['label']}",
            "package": nominal["label"],
            "player_id": player_id,
            "amount": amount,
            "metode": metode,
            "status": "ERROR",
            "message": "Layanan pembayaran sedang tidak dapat dihubungi. Coba lagi dalam beberapa saat.",
            "created_at": now,
        }
        ORDERS.append(order)
        return jsonify(order), 502

    status = str(result.get("status", "FAILED"))
    message = str(result.get("message", ""))
    order = {
        "order_id": order_id,
        "game": game["name"],
        "item": f"{game['name']} - {nominal['label']}",
        "package": nominal["label"],
        "player_id": player_id,
        "amount": amount,
        "metode": metode,
        "status": status,
        "message": message,
        "created_at": now,
    }

    if status == "SUCCESS":
        # Kurangi stok otoritatif di order_app.
        game["stock"] = max(0, game["stock"] - 1)
        event = {
            "event": "order.paid",
            "order_id": order_id,
            "game": game["name"],
            "item": order["item"],
            "package": nominal["label"],
            "player_id": player_id,
            "amount": amount,
            "metode": metode,
        }
        # FR-07: publish tanpa menunggu consumer.
        if not publish_event(event):
            order["status"] = "SUCCESS (event tertunda)"
        ORDERS.append(order)
        return jsonify(order), 200

    # FAILED: tanpa pesan ke RabbitMQ.
    ORDERS.append(order)
    return jsonify(order), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
