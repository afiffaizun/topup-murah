export interface ApiNominal {
  id: string
  label: string
  amount: number
}

export interface ApiGame {
  id: string
  name: string
  stock: number
  nominals: ApiNominal[]
}

export interface Order {
  order_id: string
  game: string
  item: string
  package: string
  player_id: string
  amount: number
  metode: string
  status: string
  message: string
  created_at: string
}

export function formatRp(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Request gagal (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function fetchCatalog(): Promise<{ games: ApiGame[]; methods: string[] }> {
  const res = await fetch("/api/catalog");
  return json(res);
}

export async function fetchOrders(): Promise<{ orders: Order[] }> {
  const res = await fetch("/api/orders");
  return json(res);
}

export interface SaldoPackage {
  id: string
  label: string
  amount: number
}

export async function fetchBalance(): Promise<{ balance: number; packages: SaldoPackage[] }> {
  const res = await fetch("/api/balance");
  return json(res);
}

export async function postSaldoTopup(package_id: string, metode: string): Promise<{ status: string; balance: number; metode?: string; message: string }> {
  const res = await fetch("/api/saldo/topup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ package_id, metode }),
  });
  return json(res);
}

export async function postTopup(payload: {
  game_id: string;
  nominal_id: string;
  player_id: string;
}): Promise<Order> {
  const res = await fetch("/api/topup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  // Order ERROR dikembalikan dengan 502 tapi body tetap Order — tampilkan sebagai hasil.
  if (res.status === 502) {
    return res.json() as Promise<Order>;
  }
  return json<Order>(res);
}
