import { images } from './images'

export type Category = 'all' | 'ml' | 'ff' | 'genshin' | 'valorant' | 'hok' | 'voucher'

export interface Game {
  id: string
  category: Exclude<Category, 'all'>
  publisher: string
  name: string
  desc: string
  startPrice: string
  image: string
  tag: string
  tagVariant: 'default' | 'secondary' | 'destructive' | 'outline'
}

export const games: Game[] = [
  { id: 'ml', category: 'ml', publisher: 'Moonton', name: 'Mobile Legends: Bang Bang', desc: 'Diamond, Starlight Pass, Weekly', startPrice: 'Rp 1.500', image: images.ml, tag: 'Diskon 25%', tagVariant: 'destructive' },
  { id: 'ff', category: 'ff', publisher: 'Garena', name: 'Free Fire MAX', desc: 'Diamond & Membership Bulanan', startPrice: 'Rp 1.000', image: images.ff, tag: 'Bonus Item', tagVariant: 'secondary' },
  { id: 'valorant', category: 'valorant', publisher: 'Riot Games', name: 'Valorant Points (VP)', desc: 'Riot ID Region Indonesia & SEA', startPrice: 'Rp 14.200', image: images.valorant, tag: 'Riot Points', tagVariant: 'outline' },
  { id: 'genshin', category: 'genshin', publisher: 'HoYoverse', name: 'Genshin Impact', desc: 'Genesis Crystals & Welkin Moon', startPrice: 'Rp 16.000', image: images.genshin, tag: 'Blessing Ready', tagVariant: 'default' },
  { id: 'pubg', category: 'voucher', publisher: 'Level Infinite', name: 'PUBG Mobile', desc: 'Unknown Cash (UC) & Royale Pass', startPrice: 'Rp 10.000', image: images.pubg, tag: 'UC Termurah', tagVariant: 'outline' },
  { id: 'hok', category: 'hok', publisher: 'Level Infinite', name: 'Honor of Kings', desc: 'Tokens Global & Weekly Card', startPrice: 'Rp 1.200', image: images.hok, tag: 'Token Resmi', tagVariant: 'secondary' },
  { id: 'hsr', category: 'genshin', publisher: 'HoYoverse', name: 'Honkai: Star Rail', desc: 'Oneiric Shards & Express Supply', startPrice: 'Rp 16.000', image: images.hsr, tag: 'Oneiric Shard', tagVariant: 'outline' },
  { id: 'steam', category: 'voucher', publisher: 'Valve Corporation', name: 'Steam Wallet IDR', desc: 'Kode Voucher Langsung Redeem', startPrice: 'Rp 12.000', image: images.steam, tag: 'Kode Digital', tagVariant: 'default' },
]

export const categories: { value: Category; label: string }[] = [
  { value: 'all', label: '🔥 Semua Game' },
  { value: 'ml', label: '📱 Mobile Legends' },
  { value: 'ff', label: '🎯 Free Fire' },
  { value: 'genshin', label: '🏹 Genshin Impact' },
  { value: 'valorant', label: '⚔️ Valorant' },
  { value: 'hok', label: '🏆 Honor of Kings' },
  { value: 'voucher', label: '🎟️ Voucher Game' },
]
