import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { fetchOrders, formatRp, type Order } from '@/lib/api'
import { cn } from '@/lib/utils'

function statusBadge(status: string): string {
  if (status === "SUCCESS") return "bg-pop-cyan text-ink";
  if (status.startsWith("SUCCESS")) return "bg-pop-yellow text-ink";
  if (status === "FAILED") return "bg-pop-magenta text-white";
  return "bg-pop-magenta text-white";
}

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [unreachable, setUnreachable] = useState(false);

  const load = useCallback(() => {
    fetchOrders()
      .then((data) => {
        setOrders(data.orders);
        setUnreachable(false);
      })
      .catch(() => setUnreachable(true));
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 5000);
    const onRefresh = () => load();
    window.addEventListener("orders:refresh", onRefresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("orders:refresh", onRefresh);
    };
  }, [load]);

  return (
    <section className="w-full border-t-2 border-ink bg-surface px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4">
          <Badge variant="plain" className="mb-1">Riwayat Order</Badge>
          <h2 className="font-display text-[28px] font-bold uppercase leading-8 tracking-tight">
            Transaksi Terakhir
          </h2>
        </div>

        <Card className="overflow-hidden p-0">
          {orders.length === 0 ? (
            <p className="p-6 text-center text-sm text-on-surface-variant">
              {unreachable ? "Riwayat belum dapat dimuat — API tidak terjangkau." : "Belum ada transaksi. Mulai top up di atas!"}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b-2 border-ink bg-surface-low text-[11px] uppercase tracking-wide">
                    <th className="px-4 py-2">Waktu</th>
                    <th className="px-4 py-2">Order ID</th>
                    <th className="px-4 py-2">Item</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.order_id} className="border-b border-ink/10 last:border-0">
                      <td className="whitespace-nowrap px-4 py-2 text-on-surface-variant">
                        {new Date(o.created_at).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-2 font-bold">{o.order_id}</td>
                      <td className="px-4 py-2">
                        {o.item} <span className="text-on-surface-variant">• {formatRp(o.amount)}</span>
                      </td>
                      <td className="px-4 py-2">
                        <span className={cn('rounded border border-ink px-2 py-0.5 text-[11px] font-bold uppercase', statusBadge(o.status))}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </section>
  )
}
