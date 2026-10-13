"""Consumer Stok (FR-09): cermin stok lokal + log sisa per game."""
from common import run

# Stok awal sesuai PRD (cermin lokal consumer; otoritatif di order_app).
STOCK = {"Mobile Legends: Bang Bang": 1000, "Free Fire MAX": 1000, "Genshin Impact": 500, "PUBG Mobile": 800}


def handle(event):
    game = str(event.get("game", ""))
    if game in STOCK:
        STOCK[game] = max(0, STOCK[game] - 1)
        print(f"[stok] {game} sisa {STOCK[game]} (order {event.get('order_id')})", flush=True)
    else:
        print(f"[stok] game tak dikenal: {game}", flush=True)


if __name__ == "__main__":
    run("stok", handle)
