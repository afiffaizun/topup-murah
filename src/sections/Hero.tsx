import { useEffect, useState } from 'react'
import { Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { games } from '@/data/games'
import { nominalsByGame } from '@/data/transaction'
import { fetchBalance, fetchCatalog, postTopup, formatRp, type ApiGame, type Order } from '@/lib/api'
import { openSaldoModal } from '@/sections/SaldoModal'
import { cn } from '@/lib/utils'
import heroImg from '@/assets/hero.png'

const FALLBACK_GAMES: ApiGame[] = games.map((g) => ({
  id: g.id,
  name: g.name,
  stock: 0,
  nominals: (nominalsByGame[g.id] ?? []).map((n) => ({
    id: n.id,
    label: n.label,
    amount: Number(n.price.replace(/[^0-9]/g, "")) || 0,
  })),
}));

function statusStyle(status: string): string {
  if (status === "SUCCESS") return "border-ink bg-pop-cyan-soft text-pop-cyan-ink";
  if (status.startsWith("SUCCESS")) return "border-ink bg-pop-yellow text-ink";
  return "border-ink bg-pop-magenta text-white";
}

export function Hero() {
  const [catalog, setCatalog] = useState<ApiGame[]>(FALLBACK_GAMES);
  const [balance, setBalance] = useState<number | null>(null);
  const [apiDown, setApiDown] = useState(false);
  const [gameId, setGameId] = useState(FALLBACK_GAMES[0].id);
  const [playerId, setPlayerId] = useState('');
  const [nominalId, setNominalId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Order | null>(null);
  const [error, setError] = useState('');

  const loadBalance = () => {
    fetchBalance()
      .then((data) => setBalance(data.balance))
      .catch(() => {});
  };

  useEffect(() => {
    fetchCatalog()
      .then((data) => {
        if (data.games.length > 0) {
          setCatalog(data.games);
          setGameId(data.games[0].id);
        }
      })
      .catch(() => setApiDown(true));
    loadBalance();
    const onRefresh = () => loadBalance();
    window.addEventListener("balance:refresh", onRefresh);
    return () => window.removeEventListener("balance:refresh", onRefresh);
  }, []);

  const game = catalog.find((g) => g.id === gameId) ?? catalog[0];
  const activeNominals = game?.nominals ?? [];
  const nominal = activeNominals.find((n) => n.id === nominalId);
  const canSubmit = playerId.trim().length > 0 && nominalId !== '' && !submitting;
  const insufficient = balance !== null && nominal !== undefined && balance < nominal.amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    setResult(null);
    try {
      const order = await postTopup({ game_id: gameId, nominal_id: nominalId, player_id: playerId.trim() });
      setResult(order);
      window.dispatchEvent(new CustomEvent("orders:refresh"));
      window.dispatchEvent(new CustomEvent("balance:refresh"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaksi gagal. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="topup" className="w-full border-b-2 border-ink bg-surface-low px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-[1fr_380px]">
        <div className="text-center lg:text-left">
          <img
            src={heroImg}
            alt="Top up game favorit"
            loading="eager"
            className="mx-auto mb-3 w-full max-w-[240px] rounded-lg border-2 border-ink object-cover shadow-ink-sm sm:max-w-[280px] lg:mx-0"
          />
          <h1 className="font-display text-2xl font-extrabold uppercase leading-none tracking-tight sm:text-3xl">
            Top up dalam hitungan detik
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-on-surface-variant">
            Harga bersahabat, 100% resmi &amp; aman.
          </p>
          <p className="mt-2 text-xs text-on-surface-variant">⚡ Proses instan • 🛡️ 100% resmi</p>
          {apiDown && (
            <p className="mt-2 text-xs font-bold text-pop-magenta">Mode offline — harga katalog lokal.</p>
          )}
        </div>

        <Card className="p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="hero-game" className="mb-1 block text-[11px] font-bold uppercase tracking-wide">
                Pilih Game
              </label>
              <select
                id="hero-game"
                value={gameId}
                onChange={(e) => {
                  setGameId(e.target.value)
                  setNominalId('')
                  setResult(null)
                }}
                className="w-full rounded border-2 border-ink bg-white px-3 py-1.5 font-body text-[13px] font-medium shadow-ink focus:outline-none"
              >
                {catalog.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="hero-player" className="mb-1 block text-[11px] font-bold uppercase tracking-wide">
                Player ID
              </label>
              <Input
                id="hero-player"
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                placeholder="Contoh: 12345678"
                required
              />
            </div>

            <div>
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide">Pilih Nominal</span>
              <div className="grid grid-cols-3 gap-1.5">
                {activeNominals.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => setNominalId(n.id)}
                    className={cn(
                      'rounded border-2 px-2 py-1.5 text-left transition-all',
                      nominalId === n.id
                        ? 'border-ink bg-pop-yellow shadow-ink-sm'
                        : 'border-ink/15 bg-white hover:border-ink',
                    )}
                  >
                    <span className="block text-xs font-bold">{n.label}</span>
                    <span className="block text-[11px] text-on-surface-variant">{formatRp(n.amount)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded border-2 border-ink bg-pop-cyan px-3 py-2 shadow-ink-sm">
              <span className="flex items-center gap-1.5 text-xs font-bold">
                <Wallet className="size-3.5" /> Bayar dengan Saldo
              </span>
              <span className="text-xs font-bold">
                {balance === null ? "Rp 150.000" : formatRp(balance)}
              </span>
            </div>
            {insufficient && nominal && (
              <p className="rounded border-2 border-ink bg-pop-magenta px-3 py-1.5 text-center text-xs font-bold text-white">
                Saldo tidak cukup untuk {nominal.label}.{" "}
                <button type="button" onClick={openSaldoModal} className="underline">Top up saldo dulu</button>
              </p>
            )}

            <Button type="submit" className="w-full" disabled={!canSubmit}>
              {submitting ? 'Memproses...' : nominal ? `Bayar • ${formatRp(nominal.amount)}` : 'Bayar'}
            </Button>

            {error && (
              <p className="rounded border-2 border-ink bg-pop-magenta px-3 py-2 text-center text-xs font-bold text-white">
                {error}
              </p>
            )}

            {result && (
              <div className={cn('rounded border-2 border-ink px-3 py-2 text-center', statusStyle(result.status))}>
                <p className="text-xs font-bold uppercase tracking-wide">{result.status} • {result.order_id}</p>
                <p className="mt-0.5 text-xs">{result.item} — {formatRp(result.amount)}</p>
                <p className="text-xs opacity-80">{result.message}</p>
              </div>
            )}
          </form>
        </Card>
      </div>
    </section>
  )
}
