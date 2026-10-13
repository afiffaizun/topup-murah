"""Payment Service: XML-RPC sinkron + pemegang saldo (single user demo).

Deviasi dari PRD awal (atas permintaan pemilik produk):
- Pembelian item HANYA pakai saldo; e-wallet dipakai khusus untuk isi saldo.
- Gagal DETERMINISTIK hanya bila saldo kurang (simulasi acak 90/10 dihapus).
- Top-up saldo via topup_saldo() menambah instan (simulasi, e-wallet hanya dicatat).
"""
from xmlrpc.server import SimpleXMLRPCServer

BALANCE = 150000

EWALLETS = {
    "qris": "QRIS",
    "gopay": "GoPay",
    "ovo": "OVO",
    "dana": "DANA",
    "shopeepay": "ShopeePay",
}

PAKET_SALDO = [
    {"id": "s10", "label": "Rp 10.000", "amount": 10000},
    {"id": "s25", "label": "Rp 25.000", "amount": 25000},
    {"id": "s50", "label": "Rp 50.000", "amount": 50000},
    {"id": "s100", "label": "Rp 100.000", "amount": 100000},
    {"id": "s200", "label": "Rp 200.000", "amount": 200000},
]


def get_balance():
    return {"balance": BALANCE}


def get_paket_saldo():
    return {"packages": PAKET_SALDO}


def topup_saldo(package_id, metode="qris"):
    global BALANCE
    package_id = str(package_id)
    metode = str(metode).lower()
    if metode not in EWALLETS:
        return {"status": "FAILED", "balance": BALANCE, "message": "E-wallet tidak didukung."}
    for p in PAKET_SALDO:
        if p["id"] == package_id:
            BALANCE += int(p["amount"])
            return {
                "status": "SUCCESS",
                "balance": BALANCE,
                "metode": metode,
                "message": f"Saldo +{p['label']} via {EWALLETS[metode]}.",
            }
    return {"status": "FAILED", "balance": BALANCE, "message": "Paket saldo tidak dikenal."}


def validate_payment(order_id, amount, metode):
    global BALANCE
    try:
        amount = int(amount)
    except (TypeError, ValueError):
        return {"status": "FAILED", "message": "Nominal tidak valid."}
    if str(metode).lower() != "saldo":
        return {"status": "FAILED", "message": "Pembayaran hanya memakai saldo."}
    if amount <= 0:
        return {"status": "FAILED", "message": "Nominal harus lebih dari 0."}
    if BALANCE < amount:
        return {"status": "FAILED", "message": "Saldo tidak cukup. Top up saldo terlebih dahulu."}
    BALANCE -= amount
    return {"status": "SUCCESS", "message": f"Pembayaran {order_id} berhasil. Sisa saldo Rp {BALANCE:,}.".replace(",", ".")}


if __name__ == "__main__":
    server = SimpleXMLRPCServer(("0.0.0.0", 8000), allow_none=True, logRequests=True)
    server.register_function(validate_payment, "validate_payment")
    server.register_function(get_balance, "get_balance")
    server.register_function(get_paket_saldo, "get_paket_saldo")
    server.register_function(topup_saldo, "topup_saldo")
    print("[payment_service] listening on :8000", flush=True)
    server.serve_forever()
