# PRD - Top Up Game (Integrasi RPC & Message Queue)

Oct 13, 2026 · @zack

## Ringkasan

Top Up Game adalah aplikasi checkout top-up game berbasis web React (Mobile Legends, Free Fire, Genshin Impact, PUBG Mobile) yang memperagakan tiga pola komunikasi terdistribusi sekaligus: pembayaran lewat RPC sinkron, serta notifikasi, update stok, dan laporan keuangan lewat Message Queue asinkron. Seluruh sistem berjalan di Docker dengan satu perintah (`docker compose up --build`). Produk ini dibuat sebagai mini-project praktikum Sistem Terdistribusi Pertemuan 8 dan mensimulasikan pola yang dipakai platform seperti Shopee, GoFood, dan Tokopedia.

## Latar belakang dan tujuan

Platform on-demand memisahkan jalur kritis (pembayaran, butuh jawaban pasti) dari jalur pendukung (notifikasi, stok, laporan, boleh diproses belakangan); produk ini membuktikan pemisahan itu dalam aplikasi yang benar-benar berjalan, bukan hanya di terminal.

**Masalah.** Bila semua langkah checkout dijalankan berurutan, pengguna menunggu notifikasi dan update stok yang tidak mereka butuhkan untuk melihat hasil pembayaran. Modul praktikum menuntut mahasiswa mengintegrasikan IPC, RPC, dan Message Queue dalam satu aplikasi web.

**Tujuan**

- Menampilkan hasil pembayaran ke pengguna segera setelah Payment Service membalas, tanpa menunggu consumer.
- Memproses notifikasi, update stok, dan laporan keuangan secara asinkron dan independen lewat RabbitMQ.
- Dapat dijalankan penuh dengan satu perintah Docker Compose.
- Memenuhi semua latihan tambahan modul: metode pembayaran, consumer ketiga, penanganan error, dan riwayat order.

**Non-tujuan**

- Integrasi payment gateway atau API penyedia game yang sungguhan.
- Akun pengguna, login, dan penyimpanan data permanen.
- Kesiapan produksi (skala, keamanan kredensial, observabilitas).

## Pengguna dan skenario

Dua peran memakai produk ini: pemain yang membeli top-up, dan mahasiswa atau asisten praktikum yang mengamati cara kerja sistem terdistribusinya.

| Peran | Tujuan | Cara berinteraksi |
| --- | --- | --- |
| Pemain | Membeli diamond/UC untuk akun game dengan cepat dan tahu hasilnya | Mengisi form di UI web React (http://localhost:3000), melihat status dan riwayat order |
| Mahasiswa / asisten | Membuktikan alur sinkron vs asinkron dan menguji kegagalan | Membaca log tiap container, dashboard RabbitMQ di http://localhost:15672, menghentikan container untuk uji ketahanan |

**User story**

1. Sebagai pemain, saya memilih game, nominal, memasukkan Player ID, dan memilih metode pembayaran agar order terbuat.
2. Sebagai pemain, saya langsung melihat berhasil atau gagalnya pembayaran tanpa menunggu proses lain.
3. Sebagai pemain, saya melihat pesan yang jelas bila layanan pembayaran tidak dapat dihubungi.
4. Sebagai mahasiswa, saya melihat tiga consumer mencetak log secara independen setelah order sukses.
5. Sebagai mahasiswa, saya mematikan satu komponen dan mengamati dampaknya pada sisa sistem.

## Kebutuhan fungsional

Sistem harus memenuhi 12 kebutuhan berikut; sembilan di antaranya wajib untuk alur utama modul, tiga lainnya berasal dari latihan tambahan.

| ID | Komponen | Kebutuhan | Prioritas |
| --- | --- | --- | --- |
| FR-01 | Web | Form memuat pilihan game, nominal, Player ID, dan metode pembayaran | Wajib |
| FR-02 | Web | Harga dihitung server dari katalog, bukan dikirim browser | Wajib |
| FR-03 | Web | Input tidak valid ditolak sebelum memanggil RPC | Wajib |
| FR-04 | Payment Service | `validate_payment(order_id, amount, metode_pembayaran)` membalas sinkron lewat XML-RPC | Wajib |
| FR-05 | Payment Service | Menolak metode di luar GoPay, OVO, DANA, ShopeePay, QRIS dan jumlah ≤ 0 | Wajib |
| FR-06 | Payment Service | Simulasi 90% sukses dan 10% gagal dengan pesan "Saldo tidak cukup" | Wajib |
| FR-07 | Web | Mem-publish event `order.paid` hanya bila SUCCESS, tanpa menunggu consumer | Wajib |
| FR-08 | Consumer Notifikasi | Mencetak notifikasi top-up berhasil untuk Player ID terkait | Wajib |
| FR-09 | Consumer Stok | Mengurangi stok per game (awal: Mobile Legends 1000, Free Fire 1000, Genshin Impact 500, PUBG Mobile 800) | Wajib |
| FR-10 | Consumer Laporan | Menambah satu baris per order ke `logs/laporan_keuangan.log` | Tambahan |
| FR-11 | Web | Bila Payment Service tak terjangkau, tampil pesan ramah dan status ERROR; bila RabbitMQ gagal setelah bayar sukses, order tetap SUCCESS dengan status "event tertunda" | Tambahan |
| FR-12 | Web | Menampilkan riwayat order (waktu, order ID, item, status) di halaman | Tambahan |

## Kebutuhan non-fungsional

Kebutuhan utamanya adalah keterlepasan antar komponen dan kemudahan menjalankan seluruh sistem; ketahanan data sengaja tidak dikejar di versi ini.

- **Deployment:** enam container (rabbitmq, payment\_service, order\_app, tiga consumer) naik dengan `docker compose up --build`. Web dan consumer menunggu healthcheck RabbitMQ lulus.
- **Ketahanan saat start:** consumer dan web mencoba terhubung ke RabbitMQ hingga 15 kali dengan jeda 3 detik; container memakai `restart: on-failure`.
- **Independensi consumer:** tiap consumer memiliki queue eksklusif sendiri pada exchange fanout `order_events`, sehingga satu consumer mati tidak memengaruhi yang lain.
- **Responsivitas:** satu-satunya langkah yang membuat halaman menunggu adalah panggilan RPC pembayaran.
- **Keamanan dasar:** harga tidak dipercaya dari browser; port RPC 8000 hanya terbuka di jaringan internal Docker, sedangkan 3000 (UI), 5000 (API Order App), 5672 dan 15672 (RabbitMQ) terbuka ke host. Kredensial `guest/guest` hanya untuk lingkungan lab.
- **Persistensi (batasan yang diterima):** riwayat order dan stok disimpan di memori, dan queue bersifat non-persistent, sehingga pesan untuk consumer yang sedang mati tidak dikirim ulang.

## Rancangan teknologi

Antarmuka dibangun sebagai aplikasi web React dengan Vite, shadcn/ui, dan Tailwind CSS; backend Python, RabbitMQ, dan Docker dari modul tetap dipakai, dan seluruhnya berjalan di Docker Compose.

shadcn/ui berjalan di React web, sehingga klien berupa single-page app Vite + TypeScript yang disajikan nginx; kodenya ada di folder `frontend/`.

| Lapisan | Teknologi | Peran |
| --- | --- | --- |
| Aplikasi klien | React 19, Vite, TypeScript | Single-page app untuk top-up dan riwayat order |
| Styling | Tailwind CSS v4 | Kelas utilitas dan tema gelap lewat variabel CSS |
| Komponen UI | shadcn/ui (Radix UI, lucide-react) | Select, Card, Table, Alert, Badge, Button, Input, Label |
| Pemanggilan API | `fetch` ke `/api` | Mengambil katalog, mengirim top-up, membaca riwayat |
| Web server | nginx | Menyajikan hasil build dan meneruskan `/api` ke Order App |
| Backend API | Flask (Order App) mengembalikan JSON | Menggantikan halaman HTML ber-template; tanpa CORS karena lewat proxy nginx |
| RPC dan antrean | XML-RPC Payment Service dan RabbitMQ | Tidak berubah dari rancangan awal |
| Runtime | Docker Compose, tujuh service | Frontend ikut berjalan di container (port 3000) |

**Dampak pada rancangan**

- Order App menjadi API JSON: `GET /api/catalog`, `POST /api/topup`, `GET /api/orders`, `GET /api/health`. Harga tetap dihitung di server dari katalog.
- Komponen "Web" pada kebutuhan fungsional dipecah: FR-01 dan FR-12 menjadi halaman di frontend React; FR-02, FR-03, FR-07, dan FR-11 tetap di Order App.
- Pengembangan lokal memakai `npm run dev` (port 5173) dengan proxy `/api` ke Flask di port 5000.

## Arsitektur dan kontrak event

&#91;embedded content: arsitektur sistem · 7 komponen, jalur sinkron dan asinkron\]

Order App memanggil Payment Service lewat RPC dan menunggu balasan, lalu mem-publish ke exchange fanout RabbitMQ tanpa menunggu ketiga consumer.

**Kontrak event `order.paid`** (JSON, dikirim hanya bila pembayaran SUCCESS)

| Field | Isi |
| --- | --- |
| `event` | Selalu `order.paid` |
| `order_id` | ID order 8 karakter |
| `game` | Nama game, mis. Mobile Legends |
| `item` | Ringkasan item, mis. "Mobile Legends - 86 Diamond" |
| `package` | Jumlah denom yang dibeli |
| `player_id` | Player ID tujuan top-up |
| `amount` | Harga dalam Rupiah, dari katalog server |
| `metode` | Metode pembayaran yang dipilih |

## Metrik keberhasilan dan pengujian

Produk dianggap berhasil bila kelima skenario uji di bawah lulus dan perilaku sinkron vs asinkron dapat dibuktikan dari log serta dashboard RabbitMQ.

**Metrik keberhasilan**

- Setiap order SUCCESS menghasilkan satu log di ketiga consumer saat semuanya hidup.
- Order FAILED atau ERROR tidak menambah pesan di queue RabbitMQ.
- Halaman hasil tampil setelah balasan RPC saja, tanpa bergantung pada status consumer.
- Seluruh sistem naik dari kondisi bersih hanya dengan `docker compose up --build`.

**Skenario uji**

| No | Skenario | Hasil yang diharapkan |
| --- | --- | --- |
| 1 | Top-up normal dengan semua container hidup | Status SUCCESS; notifikasi, stok, dan laporan mencetak log |
| 2 | Pembayaran ditolak (10% acak, "Saldo tidak cukup") | Status FAILED; tidak ada pesan baru di RabbitMQ |
| 3 | `docker compose stop consumer_stok`, top-up, lalu `start` lagi | Pesan tidak dikirim ulang karena queue non-persistent |
| 4 | `docker compose stop payment_service`, lalu top-up | Pesan ramah di web; status ERROR di riwayat |
| 5 | `docker compose stop rabbitmq`, lalu top-up | Pembayaran SUCCESS dengan status "SUCCESS (event tertunda)" |

## Risiko dan pengembangan lanjutan

Risiko terbesar versi ini adalah kehilangan pesan dan data, karena queue, riwayat, dan stok sengaja tidak dipersistenkan; semuanya dapat ditutup pada iterasi berikutnya.

| Risiko | Dampak | Kondisi saat ini | Mitigasi lanjutan |
| --- | --- | --- | --- |
| Queue non-persistent dan `auto_ack` | Pesan hilang bila consumer mati atau crash | Diterima sebagai bahan analisis praktikum | Queue durable bernama, pesan persistent, ack manual |
| Publish gagal setelah pembayaran sukses | Notifikasi dan stok tidak pernah terproses | Order ditandai "event tertunda", belum dikirim ulang | Outbox atau retry terjadwal |
| Panggilan RPC tanpa timeout eksplisit | Web dapat menggantung bila Payment Service lambat | Belum ditangani | Timeout pada klien RPC |
| Riwayat dan stok di memori | Data hilang saat container restart | Diterima untuk lab | Database (misalnya PostgreSQL) untuk order dan stok |
| Kredensial default RabbitMQ | Akses tak sah bila port terbuka di luar lab | `guest/guest` | Kredensial khusus lewat variabel lingkungan |

**Pengembangan lanjutan**

- Membandingkan exchange fanout dengan satu queue yang dibagi dua consumer (round-robin) untuk poin analisis laporan.
- Menambah consumer baru tanpa mengubah `order_app`, misalnya pengiriman e-mail bukti pembayaran.
- Menambah status order yang diperbarui oleh consumer, bukan hanya oleh web.
