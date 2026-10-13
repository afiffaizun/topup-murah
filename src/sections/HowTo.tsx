import { ArrowRight, Diamond, Gamepad2, ScanLine } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

const steps = [
  { icon: Gamepad2, color: 'bg-pop-cyan', n: '01', title: '1. Masukkan ID Game', text: 'Ketikkan User ID & Server akun gamemu. Sistem memverifikasi otomatis nickname secara real-time.' },
  { icon: Diamond, color: 'bg-pop-yellow', n: '02', title: '2. Pilih Nominal', text: 'Pilih paket Diamonds, UC, Genesis Crystals, atau voucher sesuai kebutuhan dengan harga hemat.' },
  { icon: ScanLine, color: 'bg-pop-cyan-soft', n: '03', title: '3. Bayar & Selesai', text: 'Scan QRIS atau e-wallet pilihanmu. Dalam 3 detik, item game langsung masuk ke akunmu!' },
]

export function HowTo() {
  return (
    <section className="relative w-full border-y-2 border-ink bg-surface-low px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-10 max-w-xl text-center">
          <Badge className="-rotate-1 px-3 py-1 text-[13px]">Mudah &amp; Anti Ribet</Badge>
          <h2 className="mt-1 font-display text-[28px] font-bold uppercase leading-8 tracking-tight sm:text-[40px] sm:leading-[44px]">Cara Top Up 3 Langkah</h2>
          <p className="mt-1 text-[15px] text-on-surface-variant">Tanpa perlu registrasi akun berbelit, transaksi selesai dalam hitungan detik.</p>
        </div>
        <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2].map((i) => (
            <div key={i} className="absolute top-1/2 z-0 hidden -translate-x-1/2 -translate-y-1/2 md:block" style={{ left: `${(i * 100) / 3}%` }}>
              <ArrowRight className="size-9" />
            </div>
          ))}
          {steps.map(({ icon: Icon, color, n, title, text }) => (
            <Card key={n} className="relative z-10 items-center p-6 text-center">
              <div className={`mb-4 flex size-14 items-center justify-center rounded-full border-2 border-ink shadow-ink ${color}`}>
                <Icon className="size-6" />
              </div>
              <Badge variant="outline" className="mb-2 border bg-surface-high shadow-none">Langkah {n}</Badge>
              <h3 className="mb-1 font-display text-xl font-bold">{title}</h3>
              <p className="text-[13px] leading-[18px] text-on-surface-variant">{text}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
