# CalmNow — Reda Marah Cepat

[![MIT License](https://img.shields.io/github/license/helmis14/calm_now)](LICENSE)
[![CI](https://github.com/helmis14/calm_now/actions/workflows/ci.yml/badge.svg)](https://github.com/helmis14/calm_now/actions/workflows/ci.yml)
[![Issues](https://img.shields.io/github/issues/helmis14/calm_now)](https://github.com/helmis14/calm_now/issues)
[![Stars](https://img.shields.io/github/stars/helmis14/calm_now?style=social)](https://github.com/helmis14/calm_now/stargazers)

CalmNow adalah web ringan untuk menurunkan arousal & meredakan marah secara cepat melalui 6 sesi berbasis bukti: **Napas 4–6**, **Postur**, **Alam virtual (video/audio)**, **PMR**, **Cold-face**, dan **Affect labeling + Jurnal Positif**. Fokus UI: **satu kartu tengah** (kiri/kanan blur), navigasi minimal, dan **privasi lokal** (jurnal tersimpan di perangkat).

> Nada merek: hangat • menenangkan • jelas. Target: akses cepat (≤2 klik), responsif iPhone/Android/iPad.

---

## ✨ Fitur

- 6 sesi intervensi cepat (lihat “Bukti Ilmiah”).
- Fokus kartu tunggal (spotlight tengah), swipe antar sesi.
- Kontrol ringkas: Bahasa (ID/EN), Level (tema & durasi). **Mute disembunyikan di mobile.**
- Tombol **Start** dengan cincin progres + **auto-disable** kontrol saat sesi berjalan (khusus Sesi 5 hanya **Stop** yang aktif).
- **Jurnal privat** (localStorage), ringkasan, ekspor `.txt`.
- **Share Card** 1080×1920 (9:16), tema Pastel/Vibrant.
- Mobile-first & A11y (prefers-reduced-motion, focus ring).
- Offline-friendly (SW dasar; tidak mem-precache media pihak ketiga).

---

## 🖼️ Media & Lisensi

- **Audio ambience (mode Audio di “Alam Virtual”)**  
  *Okolní — Chilling Waves Ambient (Chill Out Music for Relaxation) — 13880*, Pixabay  
  Halaman: https://pixabay.com/cs/music/okolní-chilling-waves-ambient-chill-out-music-for-relaxation-13880/  
  **Gunakan URL MP3 langsung** dari tombol *Download* (contoh: `https://cdn.pixabay.com/download/audio/...mp3?...`).  
  Simpan sebagai konstanta `AMB_URL` di kode.

- **Video (mode Video di “Alam Virtual”)**  
  Contoh YouTube embed: relaksasi alam. Gunakan embed; **jangan re-host**.

> Selalu cek syarat lisensi tiap aset. Jangan cache/offline-kan media pihak ketiga di Service Worker.

---

## 🧪 Bukti Ilmiah

- **Napas 4–6 bpm — Meta-analisis & RCT HRV-biofeedback; kuat untuk regulasi emosi/menurunkan arousal.**  
  https://pubmed.ncbi.nlm.nih.gov/32385728  
  https://pmc.ncbi.nlm.nih.gov/articles/PMC10412682

- **Postur duduk/berbaring — Fisiologi otonom kuat (HRV) + eksperimen postur-emosi; mekanistik-aplikatif.**  
  https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2022.1009806  
  https://pmc.ncbi.nlm.nih.gov/articles/PMC7937484

- **Alam virtual — Meta-analisis & RCT; efek nyata, umumnya < alam asli, tapi cukup untuk penurunan stres cepat via web.**  
  https://pmc.ncbi.nlm.nih.gov/articles/PMC7554239  
  https://journals.sagepub.com/doi/abs/10.1177/019874290302800203

- **PMR — Banyak uji; efektif untuk relaksasi, ada data pada kemarahan/agresi.**  
  https://pmc.ncbi.nlm.nih.gov/articles/PMC8272667  
  https://journals.sagepub.com/doi/abs/10.1177/019874290302800203

- **Cold-face — Fisiologi refleks selam mapan; bukti klinis awal untuk panik/over-arousal.**  
  https://pmc.ncbi.nlm.nih.gov/articles/PMC8667218

- **Affect labeling — fMRI: amigdala↓, PFC↑; studi perilaku/klinis mendukung pada intensitas tinggi.**  
  https://pubmed.ncbi.nlm.nih.gov/17576282  
  https://pmc.ncbi.nlm.nih.gov/articles/PMC9799301

---

## 📦 Menjalankan Lokal

```bash
# 1) clone
git clone https://github.com/your-org/your-repo.git
cd your-repo

# 2) server statis (contoh)
python3 -m http.server 5173
# buka http://localhost:5173
