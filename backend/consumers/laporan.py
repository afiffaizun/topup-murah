"""Consumer Laporan (FR-10): tambah 1 baris per order ke logs/laporan_keuangan.log."""
import os

from common import run

LOG_PATH = os.environ.get("LAPORAN_PATH", "/logs/laporan_keuangan.log")


def handle(event):
    line = (
        f"{event.get('order_id')}|{event.get('game')}|{event.get('item')}|"
        f"{event.get('player_id')}|{event.get('amount')}|{event.get('metode')}\n"
    )
    os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(line)
    print(f"[laporan] recorded {event.get('order_id')}", flush=True)


if __name__ == "__main__":
    run("laporan", handle)
