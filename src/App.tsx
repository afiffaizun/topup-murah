import { Footer } from '@/sections/Footer'
import { GameCatalog } from '@/sections/GameCatalog'
import { Header } from '@/sections/Header'
import { HowTo } from '@/sections/HowTo'
import { Hero } from '@/sections/Hero'
import { OrderHistory } from '@/sections/OrderHistory'
import { SaldoModal } from '@/sections/SaldoModal'

export default function App() {
  return (
    <>
      <Header />
      <main className="w-full bg-surface pt-16">
        <Hero />
        <GameCatalog />
        <OrderHistory />
        <HowTo />
      </main>
      <Footer />
      <SaldoModal />
    </>
  )
}
