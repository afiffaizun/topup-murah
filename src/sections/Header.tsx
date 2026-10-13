import { Wallet } from 'lucide-react'
import { images } from '@/data/images'

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b-2 border-ink bg-white">
      <div className="mx-auto flex h-16 w-full items-center justify-between gap-6 px-4 sm:px-8">
        <div className="flex shrink-0 items-center">
          <a href="#" className="flex items-center gap-2">
            <img src={images.logo} alt="POPTOPUP! Logo" className="h-8 w-auto object-contain" />
            <span className="font-display text-[28px] font-bold uppercase leading-[34px] tracking-tight">POPTOPUP!</span>
          </a>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="hidden items-center gap-1 rounded border-2 border-ink bg-pop-cyan px-4 py-1.5 shadow-ink sm:flex">
            <Wallet className="size-3.5" />
            <span className="whitespace-nowrap text-[13px] font-bold tracking-[0.04em]">Saldo: Rp 150.000</span>
          </div>
          <a href="#" className="flex items-center justify-center rounded-full border-2 border-ink p-0.5 shadow-ink-sm transition-transform hover:-translate-x-px hover:-translate-y-px">
            <img src={images.profile} alt="Profile" className="size-8 rounded-full object-cover" />
          </a>
        </div>
      </div>
    </header>
  )
}
