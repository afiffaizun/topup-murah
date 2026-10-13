export interface Nominal {
  id: string
  label: string
  price: string
}

export interface PaymentMethod {
  id: string
  label: string
}

// Nominal & harga dibedakan per game (key = games.ts id).
export const nominalsByGame: Record<string, Nominal[]> = {
  ml: [
    { id: 'ml-1', label: '86 Diamond', price: 'Rp 19.500' },
    { id: 'ml-2', label: '172 Diamond', price: 'Rp 38.000' },
    { id: 'ml-3', label: '257 Diamond', price: 'Rp 56.500' },
    { id: 'ml-4', label: '706 Diamond', price: 'Rp 149.000' },
  ],
  ff: [
    { id: 'ff-1', label: '100 Diamond', price: 'Rp 14.000' },
    { id: 'ff-2', label: '210 Diamond', price: 'Rp 28.000' },
    { id: 'ff-3', label: '530 Diamond', price: 'Rp 68.000' },
    { id: 'ff-4', label: '1080 Diamond', price: 'Rp 135.000' },
  ],
  valorant: [
    { id: 'valo-1', label: '475 VP', price: 'Rp 65.000' },
    { id: 'valo-2', label: '1000 VP', price: 'Rp 130.000' },
    { id: 'valo-3', label: '2050 VP', price: 'Rp 255.000' },
    { id: 'valo-4', label: '3650 VP', price: 'Rp 440.000' },
  ],
  genshin: [
    { id: 'gi-1', label: '60 Crystal', price: 'Rp 16.000' },
    { id: 'gi-2', label: '330 Crystal', price: 'Rp 75.000' },
    { id: 'gi-3', label: '1090 Crystal', price: 'Rp 240.000' },
    { id: 'gi-4', label: '2240 Crystal', price: 'Rp 479.000' },
  ],
  pubg: [
    { id: 'pubg-1', label: '60 UC', price: 'Rp 14.500' },
    { id: 'pubg-2', label: '325 UC', price: 'Rp 75.000' },
    { id: 'pubg-3', label: '660 UC', price: 'Rp 149.000' },
    { id: 'pubg-4', label: '1800 UC', price: 'Rp 379.000' },
  ],
  hok: [
    { id: 'hok-1', label: '80 Token', price: 'Rp 15.000' },
    { id: 'hok-2', label: '240 Token', price: 'Rp 45.000' },
    { id: 'hok-3', label: '400 Token', price: 'Rp 72.000' },
    { id: 'hok-4', label: '800 Token', price: 'Rp 140.000' },
  ],
  hsr: [
    { id: 'hsr-1', label: '60 Shard', price: 'Rp 16.000' },
    { id: 'hsr-2', label: '330 Shard', price: 'Rp 75.000' },
    { id: 'hsr-3', label: '1090 Shard', price: 'Rp 240.000' },
    { id: 'hsr-4', label: '2240 Shard', price: 'Rp 479.000' },
  ],
  steam: [
    { id: 'steam-1', label: 'Wallet Rp 12rb', price: 'Rp 13.500' },
    { id: 'steam-2', label: 'Wallet Rp 60rb', price: 'Rp 65.000' },
    { id: 'steam-3', label: 'Wallet Rp 90rb', price: 'Rp 96.000' },
    { id: 'steam-4', label: 'Wallet Rp 120rb', price: 'Rp 127.000' },
  ],
}

// E-wallet dipakai khusus untuk isi saldo (pembelian item hanya pakai saldo).
export const paymentMethods: PaymentMethod[] = [
  { id: 'qris', label: 'QRIS' },
  { id: 'gopay', label: 'GoPay' },
  { id: 'ovo', label: 'OVO' },
  { id: 'dana', label: 'DANA' },
  { id: 'shopeepay', label: 'ShopeePay' },
]
