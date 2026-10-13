import { Headset, ShieldCheck, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const pay = ['QRIS', 'GOPAY', 'OVO', 'DANA', 'BCA']

export function Footer() {
  return (
    <footer className="mt-8 w-full border-t-2 border-ink bg-surface-low">
      <div className="flex w-full flex-col items-center justify-between gap-6 px-4 py-10 sm:px-8 md:flex-row">
        <div className="flex flex-wrap items-center gap-4">
          <Badge className="px-4 py-1"><Zap className="size-3.5" /> Pengiriman Instan 1-3 Detik</Badge>
          <Badge variant="outline" className="px-4 py-1 normal-case tracking-normal"><ShieldCheck className="size-3.5" /> 100% Legal &amp; Resmi</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[11px] font-bold uppercase tracking-[0.06em] text-on-surface-variant">Metode Pembayaran:</span>
          {pay.map((p) => (
            <Badge key={p} variant="outline">{p}</Badge>
          ))}
        </div>
        <a href="#" className="flex items-center gap-1 rounded border-2 border-ink bg-white px-4 py-1.5 text-[11px] font-bold tracking-[0.06em] shadow-ink transition-all hover:bg-pop-yellow">
          <Headset className="size-3.5" /> Bantuan 24/7 CS
        </a>
      </div>
      <div className="w-full border-t border-ink/20 px-4 py-4 text-center">
        <p className="text-[13px] text-on-surface-variant">© 2025 POPTOPUP! All game titles and trademarks belong to their respective publishers.</p>
      </div>
    </footer>
  )
}
