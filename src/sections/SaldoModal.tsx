import { useCallback, useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { fetchBalance, postSaldoTopup, formatRp, type SaldoPackage } from '@/lib/api'
import { paymentMethods } from '@/data/transaction'
import { cn } from '@/lib/utils'

const FALLBACK_PACKAGES: SaldoPackage[] = [
  { id: 's10', label: 'Rp 10.000', amount: 10000 },
  { id: 's25', label: 'Rp 25.000', amount: 25000 },
  { id: 's50', label: 'Rp 50.000', amount: 50000 },
  { id: 's100', label: 'Rp 100.000', amount: 100000 },
  { id: 's200', label: 'Rp 200.000', amount: 200000 },
];

export function openSaldoModal() {
  window.dispatchEvent(new CustomEvent("saldo:open"));
}

export function SaldoModal() {
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [packages, setPackages] = useState<SaldoPackage[]>(FALLBACK_PACKAGES);
  const [packageId, setPackageId] = useState('');
  const [methodId, setMethodId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    fetchBalance()
      .then((data) => {
        setBalance(data.balance);
        if (data.packages.length > 0) setPackages(data.packages);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onOpen = () => {
      setOpen(true);
      setMessage('');
      setError('');
      load();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("saldo:open", onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("saldo:open", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, [load]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open ]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageId || !methodId || submitting) return;
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      const res = await postSaldoTopup(packageId, methodId);
      setBalance(res.balance);
      setMessage(res.message);
      setPackageId('');
      window.dispatchEvent(new CustomEvent("balance:refresh"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Top up saldo gagal. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-4"
      onClick={() => setOpen(false)}
    >
      <Card
        className="w-full max-w-md p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold uppercase leading-none">Isi Saldo</h2>
            <p className="mt-1 text-xs text-on-surface-variant">
              Saldo saat ini: <strong>{balance === null ? "Rp 150.000" : formatRp(balance)}</strong>
            </p>
          </div>
          <button
            type="button"
            aria-label="Tutup"
            onClick={() => setOpen(false)}
            className="rounded border-2 border-ink bg-white p-1 shadow-ink-sm transition-transform hover:-translate-x-px hover:-translate-y-px"
          >
            <X className="size-4" strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {packages.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPackageId(p.id)}
                className={cn(
                  'rounded border-2 px-3 py-2 text-center transition-all',
                  packageId === p.id
                    ? 'border-ink bg-pop-yellow shadow-ink-sm'
                    : 'border-ink/15 bg-white hover:border-ink',
                )}
              >
                <span className="block text-sm font-bold">{p.label}</span>
                <span className="block text-[11px] text-on-surface-variant">+{formatRp(p.amount)}</span>
              </button>
            ))}
          </div>

          <div>
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide">Bayar Pakai</span>
            <div className="flex flex-wrap gap-1.5">
              {paymentMethods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethodId(m.id)}
                  className={cn(
                    'flex items-center gap-1 rounded border-2 px-2.5 py-1 text-xs font-bold transition-all',
                    methodId === m.id
                      ? 'border-ink bg-pop-cyan shadow-ink-sm'
                      : 'border-ink/15 bg-white hover:border-ink',
                  )}
                >
                  {methodId === m.id && <Check className="size-3.5" strokeWidth={3} />}
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={!packageId || !methodId || submitting}>
            {submitting ? 'Memproses...' : 'Tambah Saldo'}
          </Button>

          {message && (
            <p className="rounded border-2 border-ink bg-pop-cyan-soft px-3 py-2 text-center text-xs font-bold text-pop-cyan-ink">
              {message}
            </p>
          )}
          {error && (
            <p className="rounded border-2 border-ink bg-pop-magenta px-3 py-2 text-center text-xs font-bold text-white">
              {error}
            </p>
          )}
        </form>
      </Card>
    </div>
  )
}
