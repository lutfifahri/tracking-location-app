# 🗺️ Laravel + React + Leaflet CRUD

Aplikasi CRUD lokasi menggunakan **Laravel 11**, **React (Inertia.js)**, dan **Leaflet.js** untuk menampilkan peta interaktif seperti Gojek tracking system.

---

## 🚀 Fitur Utama

-   Create, Read, Update, Delete (CRUD) data lokasi
-   Upload foto lokasi
-   Menampilkan marker di peta menggunakan Leaflet
-   Real-time form validation dengan Inertia React
-   SweetAlert untuk notifikasi interaktif

---

## 🧩 Teknologi yang Digunakan

-   **Laravel 12.35.1**
-   **Inertia.js (React Adapter)**
-   **Vite**
-   **Leaflet.js**
-   **TailwindCSS**
-   **SweetAlert2**

---

## ⚙️ Cara Install & Jalankan

### 1. Clone project ini

```bash
git clone https://github.com/username/nama-project.git
cd nama-project

```

### 2. Install dependency Laravel

```bash
    composer install
```

### 3. Install dependency Node.js

```bash
npm install
```

### Jika terjadi error Leaflet dengan React 18, gunakan:

```bash
npm install react-leaflet@4.2.1 leaflet
```

### 4. Copy environment

```bash
cp .env.example .env
```

### 5. Generate key dan setup database

```bash
php artisan key:generate
php artisan migrate
php artisan storage:link
```

### 6. Jalankan server

```bash
php artisan serve
npm run dev
```

### Lalu buka: http://localhost:8000

## by.LUTFI FAHRI
