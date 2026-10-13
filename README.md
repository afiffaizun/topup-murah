# Top Up Game (Integrasi RPC & Message Queue)

Aplikasi checkout top-up game berbasis web (Mobile Legends, Free Fire, Genshin Impact, PUBG Mobile)
untuk praktikum Sistem Terdistribusi. Jalur kritis **pembayaran lewat RPC sinkron** (jawaban pasti),
jalur pendukung **notifikasi, update stok, dan laporan keuangan lewat Message Queue asinkron**.
Seluruh sistem berjalan dengan **satu perintah Docker Compose**.

**Model pembayaran: saldo dompet.** Semua pembelian item dipotong dari satu saldo demo
(awal **Rp 150.000**, tersimpan di `payment_service`). Saldo kurang → transaksi `FAILED`;
tambah saldo dulu lewat **popup Isi Saldo** (tombol **Top Up** di navbar): pilih paket
Rp 10rb–200rb, pilih e-wallet (QRIS/GoPay/OVO/DANA/ShopeePay), saldo masuk instan
(simulasi — e-wallet hanya dicatat, tanpa biaya).

## Arsitektur

```
Browser :3000 (nginx + React)
   └─ /api ─▶ order_app :5000 (Flask)
                 ├─ RPC sinkron ─▶ payment_service :8000 (XML-RPC, internal saja)
                 └─ publish fire-and-forget ─▶ RabbitMQ fanout exchange `order_events`
                        ├─ queue eksklusif ─▶ consumer_notifikasi
                        ├─ queue eksklusif ─▶ consumer_stok
                        └─ queue eksklusif ─▶ consumer_laporan → logs/laporan_keuangan.log
```

| Layanan | Alamat | Keterangan |
|---|---|---|
| Website | http://localhost:3000 | Form top-up + katalog + riwayat order (isi saldo via popup) |
| Order API | http://localhost:5000/api/health | Cek kesehatan (`{"status":"ok"}`) |
| Saldo API | http://localhost:5000/api/balance | Saldo + paket isi saldo (`{"balance":...,"packages":[...]}`) |
| RabbitMQ Dashboard | http://localhost:15672 | Login `guest` / `guest` |
| Payment RPC | port 8000, internal Docker saja | `validate_payment` + `get_balance` + `topup_saldo`; tidak dibuka ke host |

Kontrak event `order.paid` (hanya dikirim bila SUCCESS):
`event, order_id (8 karakter), game, item, package, player_id, amount (dari katalog server), metode ("saldo")`.

## Prasyarat

- Docker + Docker Compose v2
- Port `3000, 5000, 5672, 15672` kosong

## Cara Menjalankan

```bash
docker compose up --build
```

Tunggu sampai RabbitMQ berstatus `healthy` dan semua container `Up`
(cek dengan `docker compose ps`). Lalu:

1. Buka http://localhost:3000 (saldo awal Rp 150.000 tampil di navbar)
2. Isi form: **Pilih Game → Player ID → Pilih Nominal → Bayar** (otomatis pakai saldo)
3. Hasil langsung tampil di form:
   - `SUCCESS` — pembayaran berhasil, saldo terpotong, event terkirim ke 3 consumer
   - `FAILED` — saldo tidak cukup (`Saldo tidak cukup. Top up saldo terlebih dahulu.`), tanpa pesan ke queue
   - `ERROR` — layanan pembayaran tak terjangkau
   - `SUCCESS (event tertunda)` — bayar berhasil tapi RabbitMQ gagal (saldo tetap terpotong)
4. Saldo habis? Klik **Top Up** di navbar (popup): pilih paket → pilih e-wallet → **Tambah Saldo** (saldo navbar ikut bertambah)
5. Lihat transaksi di tabel **Transaksi Terakhir** (waktu, order ID, item, status)

Berhenti dan bersihkan:

```bash
docker compose down
```

## Skenario Uji (sesuai PRD)

Jalankan `docker compose up --build` dari kondisi bersih, lalu:

| No | Perintah | Hasil yang diharapkan |
|---|---|---|
| 1 | Transaksi normal (saldo cukup) | `SUCCESS`, saldo berkurang; ketiga consumer mencetak log; 1 baris baru di `logs/laporan_keuangan.log` |
| 2 | Beli nominal termahal (mis. Genshin 2240 Crystal Rp 479.000) | `FAILED` (`Saldo tidak cukup...`); tidak ada pesan baru di queue; saldo tidak berubah |
| 3 | `docker compose stop consumer_stok` → transaksi → `docker compose start consumer_stok` | Pesan tidak dikirim ulang (queue non-persistent) |
| 4 | `docker compose stop payment_service` → transaksi / isi saldo | Pesan ramah di web; status `ERROR` di riwayat |
| 5 | `docker compose stop rabbitmq` → transaksi | Status `SUCCESS (event tertunda)`, saldo tetap terpotong |

Melihat log tiap service:

```bash
docker compose logs order_app
docker compose logs payment_service
docker compose logs consumer_notifikasi consumer_stok consumer_laporan
```

Isi laporan keuangan:

```bash
cat logs/laporan_keuangan.log
```

## Struktur Repo

```
src/                          # Frontend React (Vite + Tailwind + shadcn/ui)
  sections/                   # Header (saldo live + tombol Top Up), Hero (form bayar pakai saldo),
                              # GameCatalog, SaldoModal (popup isi saldo + pilih e-wallet),
                              # OrderHistory, HowTo, Footer
  lib/api.ts                  # Klien fetch /api (catalog, balance, topup, saldo, orders)
backend/
  order_app/                  # Flask API + klien RPC + publisher MQ (app.py, Dockerfile)
  payment_service/            # XML-RPC + pemegang saldo: validate_payment, get_balance,
                              # get_paket_saldo, topup_saldo(package_id, metode) (server.py, Dockerfile)
  consumers/                  # notifikasi.py, stok.py, laporan.py (+ common.py, Dockerfile)
docker-compose.yml            # 7 service
nginx.conf                    # Serve dist + proxy /api ke order_app
Dockerfile.frontend           # Build frontend → nginx
logs/                         # Output laporan_keuangan.log (dibuat saat runtime)
```

## Deviasi dari PRD Awal

Atas permintaan pemilik produk, pembayaran disederhanakan menjadi **saldo tunggal**:

- Pembelian item hanya pakai `metode: "saldo"` (e-wallet tidak berlaku untuk beli item).
- E-wallet (QRIS/GoPay/OVO/DANA/ShopeePay) hidup lagi **khusus untuk isi saldo**:
  `POST /api/saldo/topup` wajib menyertakan `metode`; gagal 400 bila kosong/tak didukung.
  Pengisian instan (simulasi, e-wallet hanya dicatat di pesan hasil, tanpa biaya/admin).
- FR-06 (acak 90/10) → dihapus; `FAILED "Saldo tidak cukup"` kini **deterministik** (saldo &lt; harga).
- Skenario uji no. 2 menyesuaikan: bukan pengulangan acak, melainkan pembelian melebihi saldo.
- Endpoint tambahan di luar PRD: `GET /api/balance`, `POST /api/saldo/topup`;
  fungsi RPC tambahan: `get_balance`, `get_paket_saldo`, `topup_saldo`.
- Batasan lab tetap: saldo/riwayat/stok di memori (hilang saat container restart).

## Troubleshooting

- **Port bentrok** (`address already in use`): hentikan aplikasi yang memakai port tersebut, atau ubah mapping di `docker-compose.yml`.
- **RabbitMQ belum healthy**: tunggu ±30 detik; consumer dan order_app otomatis retry hingga 15×3 detik.
- **`ERROR` terus-menerus**: pastikan `payment_service` Up (`docker compose ps`); ia hanya bisa diakses dari dalam network Docker, bukan dari host.
- **Riwayat kosong setelah restart**: normal — riwayat dan stok disimpan di memori (batasan lab yang disengaja).

## Batasan yang Disengaja (bahan analisis praktikum)

Queue non-persistent + `auto_ack` (pesan hilang bila consumer mati), riwayat/stok di memori
(hilang saat restart), RPC tanpa timeout eksplisit di sisi server, kredensial RabbitMQ default `guest/guest`.
