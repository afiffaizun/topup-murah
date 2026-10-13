"""Consumer helpers: koneksi retry 15x3s + queue eksklusif di fanout exchange."""
import json
import os
import time

import pika

EXCHANGE = "order_events"
RABBIT_HOST = os.environ.get("RABBITMQ_HOST", "localhost")
RABBIT_USER = os.environ.get("RABBITMQ_USER", "guest")
RABBIT_PASS = os.environ.get("RABBITMQ_PASS", "guest")


def connect():
    creds = pika.PlainCredentials(RABBIT_USER, RABBIT_PASS)
    last_err = None
    for attempt in range(1, 16):
        try:
            params = pika.ConnectionParameters(host=RABBIT_HOST, credentials=creds, socket_timeout=3)
            conn = pika.BlockingConnection(params)
            ch = conn.channel()
            ch.exchange_declare(exchange=EXCHANGE, exchange_type="fanout", durable=False)
            # Queue eksklusif per consumer (independen, non-persistent).
            q = ch.queue_declare(queue="", exclusive=True, auto_delete=True)
            ch.queue_bind(exchange=EXCHANGE, queue=q.method.queue)
            return conn, ch, q.method.queue
        except Exception as e:  # noqa: BLE001
            last_err = e
            print(f"[consumer] RabbitMQ belum siap ({attempt}/15): {e}", flush=True)
            time.sleep(3)
    raise RuntimeError(f"RabbitMQ tak terjangkau: {last_err}")


def run(name, handler):
    conn, ch, queue = connect()
    print(f"[{name}] listening...", flush=True)

    def on_msg(_ch, _method, _props, body):
        try:
            event = json.loads(body)
        except json.JSONDecodeError:
            return
        if event.get("event") != "order.paid":
            return
        handler(event)

    ch.basic_consume(queue=queue, on_message_callback=on_msg, auto_ack=True)
    ch.start_consuming()
