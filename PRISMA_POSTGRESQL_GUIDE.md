# Panduan Migrasi Database PostgreSQL (Supabase / Neon) untuk Rasaji

Dokumen ini menjelaskan langkah-langkah detail untuk memigrasikan database platform **Rasaji** dari **SQLite** (lokal) ke **PostgreSQL** (production) seperti **Supabase** atau **Neon**.

---

## 1. Perbedaan Setup Lokal vs Production

Platform Rasaji dirancang agar fleksibel:
*   **Lokal (SQLite)**: Sangat cocok untuk pengembangan cepat karena tidak memerlukan instalasi server database eksternal. Semua data disimpan dalam file lokal `prisma/dev.db`.
*   **Production (PostgreSQL)**: Wajib digunakan di lingkungan cloud stateless (seperti Google Cloud Run) karena SQLite file akan terhapus otomatis setiap kali container mati/re-scale. PostgreSQL menyediakan penyimpanan data yang permanen, aman, dan dapat diakses bersama oleh beberapa instance container sekaligus.

---

## 2. Langkah-Langkah Migrasi Ke PostgreSQL

### Langkah 2.1: Buat Database PostgreSQL
1.  Daftar/Masuk ke [Supabase](https://supabase.com) atau [Neon](https://neon.tech).
2.  Buat project baru dan salin **Connection String URI** (biasanya dalam format `postgresql://...`).
    *   *Tips untuk Supabase*: Gunakan connection string untuk port `5432` (Direct Connection) atau Pooler URL (`session` mode) tergantung kebutuhan Anda.

### Langkah 2.2: Ubah Provider di `schema.prisma`
Buka file `prisma/schema.prisma` dan ubah datasource block dari `"sqlite"` menjadi `"postgresql"`:

```prisma
// Sebelum (SQLite):
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// Sesudah (PostgreSQL):
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Langkah 2.3: Konfigurasi Connection String di Lingkungan Anda

#### A. Pengembangan Lokal (Menggunakan PostgreSQL secara Lokal)
Perbarui file `.env` di komputer lokal Anda dengan menambahkan URL database PostgreSQL yang baru:
```env
DATABASE_URL="postgresql://username:password@ep-cool-breeze-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

#### B. Produksi (Google Cloud Run / Cloud Run Console)
Jangan memasukkan kredensial database asli ke dalam repositori git. Konfigurasikan variabel lingkungan langsung di Google Cloud Run:
1.  Buka **Google Cloud Console** -> **Cloud Run**.
2.  Pilih service `rasaji` Anda, lalu klik **Edit & Deploy New Revision**.
3.  Di tab **Variables & Secrets**, tambahkan variabel berikut:
    *   `DATABASE_URL` = *(isi dengan connection string PostgreSQL dari Supabase/Neon)*
    *   `SESSION_SECRET` = *(isi dengan string acak panjang untuk mengamankan session)*
    *   `GEMINI_API_KEY` = *(isi dengan API Key Google AI Studio Anda)*
4.  Klik **Deploy**.

---

## 3. Eksekusi Skema Database dan Pengisian Data (Seeding)

Di platform Rasaji yang baru, proses inisialisasi database telah diotomatisasi secara penuh di dalam container startup (`Dockerfile`):

Setiap kali container baru menyala (baik lokal maupun di Cloud Run):
1.  Container akan menjalankan `npx prisma db push` secara otomatis untuk membuat tabel-tabel database yang diperlukan pada PostgreSQL Anda jika belum ada.
2.  Container akan memanggil `node scripts/seed.js` untuk memasukkan **15 resep verifikasi otentik Indonesia** secara aman (idempotent - tidak akan menduplikat resep yang sudah ada).

### Melakukan Migrasi Manual dari Terminal Lokal (Opsional):
Jika Anda ingin menyiapkan database secara manual dari terminal lokal Anda, jalankan perintah berikut secara berurutan:

```bash
# 1. Regenerasi Client Prisma untuk PostgreSQL
npx prisma generate

# 2. Sinkronisasikan skema ke database PostgreSQL
npx prisma db push

# 3. Jalankan pengisian data (seeding) awal
node scripts/seed.js
```

---

## 4. Tips dan Troubleshooting Produksi

*   **SSL Mode**: Pastikan menyertakan parameter `?sslmode=require` pada connection string PostgreSQL Anda agar koneksi antara Cloud Run dan database terenkripsi secara aman.
*   **Error "Prepared Statement" pada Connection Poolers**: Jika Anda menggunakan pooling serverless (seperti PgBouncer bawaan Supabase), Anda mungkin perlu menambahkan `&pgbouncer=true` di akhir URL koneksi Prisma Anda untuk mencegah error caching query.
