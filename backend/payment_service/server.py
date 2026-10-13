"""Payment Service: XML-RPC sinkron validate_payment (FR-04/05/06)."""
import random
from xmlrpc.server import SimpleXMLRPCServer

ALLOWED = {"qris", "gopay", "ovo", "dana", "shopeepay"}


def validate_payment(order_id, amount, metode):
    try:
        amount = int(amount)
    except (TypeError, ValueError):
        return {"status": "FAILED", "message": "Nominal tidak valid."}
    metode = str(metode).lower()
    if metode not in ALLOWED:
        return {"status": "FAILED", "message": "Metode pembayaran tidak didukung."}
    if amount <= 0:
        return {"status": "FAILED", "message": "Nominal harus lebih dari 0."}
    # Simulasi 90% sukses / 10% gagal.
    if random.random() < 0.10:
        return {"status": "FAILED", "message": "Saldo tidak cukup."}
    return {"status": "SUCCESS", "message": f"Pembayaran {order_id} berhasil."}


if __name__ == "__main__":
    server = SimpleXMLRPCServer(("0.0.0.0", 8000), allow_none=True, logRequests=True)
    server.register_function(validate_payment, "validate_payment")
    print("[payment_service] listening on :8000", flush=True)
    server.serve_forever()
