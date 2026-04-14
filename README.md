## KampusMarket Monorepo

Repositori ini sekarang dipisah jadi dua bagian:

* `frontend/` untuk aplikasi React + Vite + TypeScript.
* `backend/` untuk aplikasi Laravel API.

### Struktur

```text
kampusmarket/
  frontend/
  backend/
```

### Menjalankan proyek

Jalankan backend dari folder `backend/`:

```sh
cd backend
php artisan serve
```

Lalu jalankan frontend dari folder `frontend/`:

```sh
cd frontend
npm run dev
```

Frontend sudah diproxy ke backend Laravel lewat Vite untuk request `/api`.

```