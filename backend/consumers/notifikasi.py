"""Consumer Notifikasi (FR-08): cetak notifikasi top-up berhasil."""
from common import run


def handle(event):
    print(
        f"[notifikasi] Top-up berhasil: {event.get('item')} untuk Player {event.get('player_id')} "
        f"(order {event.get('order_id')}, {event.get('metode')})",
        flush=True,
    )


if __name__ == "__main__":
    run("notifikasi", handle)
