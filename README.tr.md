# Chromatik 🎛️⚡

> *Chromatic Scale*’den esinlenilmiş, yeni nesil **beat pazaryeri ve prodüktör ekosistemi** — stüdyo kalitesinde Web Audio mimarisi, ödün vermeyen ses seviyesi, interaktif 3D bileşenler ve modern prodüktörler için uçtan uca vitrin deneyimi.

---

## 💎 Platform Yetenekleri & Mimari

Chromatik sıradan bir ses yükleme ve dinleme platformu değildir; prodüktörlerin müziğini en yüksek kalitede sergilediği, MC ve vokalistlerin ise tarayıcı içinde parçaları prova edip özelleştirebildiği profesyonel bir müzik iş istasyonudur.

---

## 🎛️ I. Ses Mühendisliği & DSP Mimarisi

### 🔊 1. Stüdyo & Satış Odaklı Ses Seviyesi Eşitleme (Loudness Normalization)
* **-9 LUFS Club-Ready Hedefi:** Spotify (-14 LUFS) veya Apple Music (-16 LUFS) gibi platformlar dinleyici için sesi kısarken, Chromatik satış platformu mantığıyla beatlerin enerjisini korumak için **-9 LUFS** seviyesine eşitler.
* **Akıllı Dinamik Kazanç (+8 dB Tavan):** Düşük seviyeli beatler en fazla +8 dB dinamik kazançla yükseltilir, aşırı patlayan beatler ise şeffaf şekilde hedefe çekilir.
* **Look-Ahead Brickwall Limiter:** AudioWorklet üzerinde çalışan 5ms look-ahead, üstel sönümleme (120ms release) ve -1 dBFS tavanlı özel tepe sınırlayıcı sayesinde distorsiyonsuz, patlamasız ve kristal berraklığında baslar.
* **Otomatik EBU R128 Analizi:** Yüklenen her beat, backend'de FFmpeg ebur128 filtresiyle entegre LUFS ve True Peak değerleri ölçülerek etiketlenir.

---

### 🧬 2. Yeni Nesil Pitch Shifter & Canlı Tonalite Dönüşümü (Signalsmith Stretch WASM)
* **Signalsmith Stretch (C++ WASM & AudioWorklet):** Faz uyumlu, davul transient'lerini (kick & snare vuruculuğunu) koruyan, bozulmasız gerçek zamanlı perde kaydırma (-12 ila +12 yarım ton).
* **Gecikme Dengelemeli Kuru Yol (Zero-Glitch Dry Path):** 0 yarım tonda işlemci tasarrufu için motor bypass edilir; açıldığında ise kuru/ıslak sinyal tam örnekleme hassasiyetiyle senkron kalır, seste atlama olmaz.
* **Düşük Güç Tüketimi Profili (Low-Power Adaptive Mode):** Mobil cihazlar veya zayıf işlemciler algılandığında STFT blokları otomatik optimize edilerek çıtırtı ve aşırı ısınma önlenir.
* **Canlı Akor & Dizi Transpozisyonu (Dynamic Key Transpose):** Pitch değiştirildiğinde parçanın gamı anında hesaplanır (ör. `C# Min` ➔ `+2 st` ➔ `D# / Eb Min`). Vokalistler parçayı satın almadan önce kendi vokal aralıklarına göre beati anında test edebilir.

---

### ⏱️ 3. Canlı Tempo / BPM & Bağımsız Vokal Prova Modu
* **Canlı BPM Hesaplama:** Oynatma hızı değiştirildiğinde parçanın güncel temposu anında gösterilir (ör. 140 BPM @ 1.1x ➔ *154 Live BPM*).
* **Hız Presetleri:** `0.8x`, `0.9x`, `1.0x (Normal)`, `1.1x`, `1.25x` tek tık butonları veya hassas kaydırıcı ile 0.5x – 1.5x aralığında akıcı hız kontrolü.
* **Bağımsız Perde & Hız:** Hızlandırıldığında seste "sincaplaşma" (chipmunk etkisi) olmaz; perde ve tempo birbirinden tamamen bağımsız yönetilir.

---

### 🥁 4. Çift Bantlı Akıllı Otomatik BPM Tespiti (Client & Server DSP)
* **İstemci Tarafı Anlık Ön Doldurma (Web Audio API):** Prodüktör yükleme modalında bir `.wav` veya `.mp3` dosyası seçtiği anda, dosyanın yüklenmesini beklemeden tarayıcıda yerel Web Audio API ile sıfır gecikmeyle BPM hesaplanır ve form kutusuna otomatik yazılır.
* **Çift Bantlı Ritmik Füzyon (Dual-Band Fusion):** Hem alt frekans (kick/bass ve boğuk R&B rimshot) hem de üst frekans (>1500Hz snare, clap, hi-hat) enerjilerini birleştiren hibrit zarf algoritması (`fluxCombined = fluxFull + fluxSnare * 1.5`).
* **20ms Sub-Bass Yumuşatma:** 50-70Hz 808 bas sinüs dalgası dalgalanmalarını ve 32'lik mikro hi-hat roll parazitlerini filtreleyerek Hood Trap, Drill ve modern trap beatlerinde yanılsamaları tamamen ortadan kaldırır.
* **Trap Half-Time & Triplet Snare Çözümleme:** Beat 3 vuruşlu half-time snare'leri ($76\text{ BPM snare} \rightarrow 152\text{ BPM}$) ve triplet alt harmoniklerini ($50.6\text{ BPM} \rightarrow 152\text{ BPM}$) otomatik olarak tespit eder.
* **Tresillo 3:2 Senkopasyon Doğrulaması:** Reggaeton, Afrobeats ve senkopeli Hip-Hop beatlerindeki 3:2 noktalı vuruş yanılsamalarını ($86.6 \rightarrow 130\text{ BPM}$, $89.1 \rightarrow 133.5\text{ BPM}$) hatasız çözer.
* **Toplu Veri Güncelleme CLI:** `npm run bpm:backfill` (`--force`, `--dry-run`) komutuyla veritabanındaki tüm eski parçaların BPM'i sunucu tarafında diskten taranıp güncellenebilir.

---

### 🔀 5. Apple Music Stili Smart Automix & Canlı Drop/Onset Tespiti
* **Dinamik Müzikal Ölçü Adaptasyonu (4-8 Bar / 16-32 Beat):** Sabit ve yapay saniye limitleri yerine; beatlerin BPM'ine ve uzunluğuna göre introyu ve outroyu tam müzikal vuruşunda (ör. 75 BPM'de 25.6 saniye, 90 BPM'de 21.3 saniye, 120 BPM'de 16 saniye) hesaplayan otonom müzikal fraz eşleme algoritması.
* **Equal-Power 64-Noktalı S-Curve:** Parça geçişlerinde enerjinin ve ses basıncının düşmesini (center dip) engelleyen `cos/sin` trigonometrik eşit-güç eğrisi ile pürüzsüz ses kaynaşması.
* **280Hz Dinamik Low-Shelf Bas Takası (Club DJ Bass-Swap):** İki beat üst üste binerken basların birbirine çarpıp çamurlaşmasını önlemek için gelen parçanın baslarını kademeli açarken çıkan parçanın alt frekanslarını filtreleyen profesyonel DJ miks tekniği.
* **Akıllı Tempo / BPM Morflama:** İki parça arasındaki BPM farkını geçiş penceresi boyunca organik olarak birbirine yaklaştıran dinamik tempo eşleme.
* **Sıfır Tıklama (Anti-Click) Donanım Koruması:** Parça ilk başladığında ve bittiğinde oluşabilecek ani DC offset veya mikro patlama seslerini engelleyen sıfır-kazanç kilitlemesi, `<audio>` `playing` tetikleyici senkronizasyonu ve 20ms asenkron yumuşak sönümleme mimarisi.
* **Kişiselleştirilmiş Hafıza:** Smart Automix modu, ses seviyesi ve normalizasyon tercihleri tarayıcıda kalıcı olarak saklanır.

---

### ✂️ 6. Hibrit Akıllı Sessizlik Törpüleme (Silence Trimming & Auto-Cue)
* **Pioneer CDJ Tarzı Auto-Cue & Outro Silence Guard (Frontend):**
  * **Outro Silence Guard:** Çalan parçanın son 25 saniyesinde Web Audio FFT analizörüyle ses sinyali sürekli olarak izlenir; ses tamamen kesildiğinde veya dijital sessizliğe düştüğünde (~800ms) dinleyiciyi gereksiz boşlukta bekletmeden parçanın bittiği sinyali verilir ve sonraki parçaya/Automix geçişine anında atlanır.
  * **Sıfır Çalma Gecikmesi (Auto-Cue):** Parça başlatıldığında baştaki ölü boşluklar elenerek ilk müzikal vuruşun anında ve gecikmesiz duyulması sağlanır.
* **Yükleme Hattında Otomatik Törpüleme (Upload Pipeline DSP):**
  * Yüklenen her ses dosyası (`taggedAudio` veya `untaggedAudio`), HLS akış paketleyicisine ve EBU R128 ölçümüne girmeden önce baş ve sonundaki dijital ölü sessizliklerden (`-50dB`, sample-accurate peak detection) arındırılır.
  * Doğal reverb ve decay (çürüme) kuyruklarını korumak adına sonda en az 0.5 saniyelik sürekli sessizlik şartı aranır; müzikal ses kuyrukları asla sert bir şekilde kesilmez.
* **Sunucudaki Gerçek Dosyalar İçin Migrasyon CLI (`npm run silence:trim`):**
  * Sunucuda halihazırda yüklü fiziksel master dosyalarını (`/srv/chromatik/media`) tarayarak baştaki ve sondaki ölü boşlukları atomik olarak törpüler.
  * Orijinal master dosyaları korumak adına otomatik `.orig.bak` yedeği alır.
  * İlgili parçaların HLS VOD akışlarını (`index.m3u8` ve AAC `.ts` segmentleri), ses koruma damgasını (`TAG_MIX_FILTER`) koruyarak yeni süreye göre baştan üretir.
  * EBU R128 ses şiddetini (LUFS) temizlenmiş akış üzerinden anında yeniden hesaplayıp MongoDB'ye işler.
  * `--dry-run`, `--force` ve `--no-backup` bayrakları ile esnek yönetim imkanı sunar.

---

## 🎨 II. Görsel Tasarım, İş İstasyonu & Kullanıcı Deneyimi

### 🎨 7. Özelleştirilebilir Sanatçı Profil Herosu & 3D Temalar
* **3 Farklı İnteraktif WebGL / Canvas Teması:**
  * **Ribbons:** Sıcak kırmızılar, akıcı neon şeritler ve yüksek enerjili dalgalanmalar.
  * **Flowfield:** Organik parçacık akışı, derin morlar ve akıcı vektör alanları.
  * **Pillars:** Fütüristik mavi-mor neon sütunlar, cyberpunk ızgaralar ve derin bas titreşimleri.
* **Bütüncül Tema Mimarisi:** Sanatçının profili için seçtiği tema, sadece arka planı değil; parça kartlarının kenarlıklarını, buton efektlerini ve BoxPlayer ışıklandırmalarını CSS değişkenleri üzerinden otomatik renklendirir.
* **Prodüktör Kimliği:** Profil başlığı, sosyal medya bağlantıları, bio, toplam dinlenme ve beğeni sayaçları, özel vitrin parçaları.

---

### 🧊 8. Cyberpunk 3D BoxPlayer (İnteraktif Beat Kartları)
* **İmleç ve Jiroskop Duyarlı 3D Tilt:** İmlecin konumunu 60 FPS hızında takip eden gerçekçi perspektif eğimi (perspective tilt).
* **Chroma Split & Scanlines:** Hover esnasında retro-fütüristik RGB ayrışması ve CRT tarama çizgisi efektleri.
* **Dönen Conic Border:** Kartın çerçevesinde profil temasıyla uyumlu 360 derece dönen dinamik ışık hüzmesi.
* **Dinamik BPM Rozeti & Entegre Çalma:** Canlı tempo etiketi, sayfa değiştirmeden doğrudan kart üzerinden başlatma/durdurma ve anlık beğeni bırakma.

---

### 🎛️ 9. Gelişmiş Alt Oynatıcı & Glassmorphic Çalma Listeleri
* **Piksel Hassasiyetinde Custom Seeker:** Buffer (önbellek) ve progress çizgilerini ayıran, sürüklemeye duyarlı akıcı arama çubuğu.
* **Kapsamlı Oynatma Ayarları Menüsü (Tune Menu):**
  * Tek tıkla "Tümünü Sıfırla" (Reset All) butonu ve aktif modifikasyon uyarı ışığı.
  * Tempo, Pitch, Smart Automix ve Normalizasyon kontrollerinin tek bir panelde birleşimi.
  * Çalan parçaya uygulanan anlık kazancı desibel cinsinden gösterme (ör. `+3.0 dB` veya `Henüz analiz edilmedi`).
* **Glassmorphic Playlist Workstation (`Playlist.vue`):** Ortam ışık şeritleri, sanatçı bağlantılı duyarlı parça listesi, süre, BPM rozetleri, anında çalma ve kuyruğa ekleme (Queue) entegrasyonu.
* **MediaSession API:** Klavye multimedya tuşları, kablosuz kulaklık kontrolleri ve kilit ekranı albüm kapağı desteği.
* **Kuyruk & Çalma Listesi Yönetimi:** Karışık çalma (shuffle), tekli ve tümünü tekrar (repeat modes), sürükle-bırak kuyruk düzeni.

---

### 🌊 10. Sonic Hero Sahnesi & İnteraktif Zaman Damgalı Yorumlar
* **WaveField ile Donatılmış Sonic Hero Sahnesi (`Home.vue`):** Ses duyarlı interaktif canvas arka planı, cyberpunk `GlitchTitle`, tür/vibe filtreleme hapları ve öne çıkan vitrin parçası (Featured Spotlight).
* **Görsel Dalga Formu (Waveform):** Parçanın dinamiğini doğrudan gösteren tıklanabilir dalga formu.
* **Zaman Damgalı Pin Yorumlar:** Dinleyiciler ve sanatçılar beatin tam istedikleri saniyesine (ör. *01:14 "Drop inanılmaz olmuş!"*) pin bırakabilir.
* **Tek Tıkla Atlama:** Yorum kutusuna tıklandığında oynatıcı otomatik olarak o saniyeye pürüzsüzce kayar.

---

## 🛡️ III. Altyapı, Güvenlik & Lisanslama Ekosistemi

### 🛡️ 11. Ses Güvenliği, Sistem Loglaması & HLS Streaming
* **Winston Günlük Dosya Rotasyonu (`winston-daily-rotate-file`):** Hem geliştirme hem üretim ortamında günlük `requests-YYYY-MM-DD.log` ve `error-YYYY-MM-DD.log` dosyaları (14 günlük otomatik temizleme döngüsü).
* **Ortam Değişkeni ile Saat Dilimi Kontrolü (`TZ`):** Sunucu işletim sistemi UTC saatinde çalışsa bile, `.env` içerisindeki `TZ` değişkeni üzerinden (ör. `TZ=Europe/Istanbul`) log zaman damgaları istenen yerel saat dilimine kolayca ayarlanabilir.
* **Prodüksiyon Düzeyinde Temizleme (Zero-Leakage Build):** Vite üretim derlemesinde tüm `console.log` ve `debugger` çağrıları temizlenir; backend tarafında production modunda geliştirici konsol logları susturulur ve TypeScript derlemesinde (`removeComments: true`) kod içi yorumlar üretim paketlerinden kaldırılır.
* **Merkezi Medya Dizin Mimarisi (`MEDIA_DIR`):** Medya yükleme ve HLS segmentasyon yolları `.env` ve `envalid` şeması üzerinden dinamik olarak yönetilir.
* **Dinamik Ses Filigranı (Voice Tagging):** Satışa sunulan parçaların önizlemesi, arka planda koruma filigranı ile dikişsiz şekilde mikslenir.
* **HLS (.m3u8) VOD Segmentasyonu:** Önizleme sesleri doğrudan indirilebilir mp3 yerine HLS parçalarına bölünür; indirme botlarına ve ses hırsızlığına karşı korunur.
* **Kasada Saklanan Orijinal Dosyalar:** Satın alınan lisansa göre Untagged WAV ve Stems (Kanal sesleri) güvenli depolama alanında şifreli olarak korunur.

---

### 💼 12. Çok Katmanlı Lisanslama & Dashboard
* **4 Seviyeli Lisans Modeli:** *Basic MP3*, *Premium WAV*, *Unlimited* ve *Exclusive* hak satışı.
* **Kapsamlı Prodüktör Paneli:** Gelir takibi, aylık kazanç, toplam dinlenme/beğeni istatistikleri ve parça yönetimi.
* **Soundkit Desteği:** Prodüktörler beat haricinde sample/drum kitlerini de platform üzerinden satışa sunabilir.

---

## 🛠️ Teknoloji Mimarisi

| Katman | Teknolojiler |
| :--- | :--- |
| **Frontend Framework** | Vue 3 (Composition API / `<script setup>`) · Vite 7 · TypeScript |
| **Durum Yönetimi & UI** | Pinia · Vuetify 3 · SCSS (Cyberpunk Glassmorphism Tokens) |
| **Next-Gen Audio Engine** | Web Audio API · AudioWorklet · Signalsmith Stretch (C++ WASM) · HLS.js |
| **BPM Tespit Motoru** | Çift Bantlı DSP Otokorelasyon (Client Web Audio API + Server FFmpeg PCM) |
| **Backend API** | Node.js · Express · TypeScript · MongoDB · Mongoose |
| **Medya & Ses İşleme** | FFmpeg (EBU R128 Loudness, Silence Trimming, Tag Looping Mix, HLS VOD Packager) |
| **Güvenlik & Auth** | JWT · Role-based Middleware · Güvenli dosya akışı |
| **Dokümantasyon** | OpenAPI / Swagger 3.0 JSDoc Entegrasyonu |
| **Yerelleştirme (i18n)** | Türkçe & İngilizce tam dinamik dil anahtarları |

---

## 📁 Monorepo Yapısı
```
chromatik/
├── frontend/             # Vue 3 + Pinia + Web Audio Engine
│   ├── src/services/     # AudioEngine, PitchShifter (WASM), Limiter (AudioWorklet), StreamResolver
│   ├── src/components/   # BoxPlayer, BottomPlayer, Waveform, CommentSection, Playlist, Navigation
│   ├── src/views/        # Home (Sonic Hero Stage), TrackPage, Profile (3D Themes), Dashboard
│   ├── src/utils/        # bpmDetector.ts (Client Web Audio DSP), audioMath.ts, themePalette.ts
│   └── src/locales/      # tr.json & en.json tam yerelleştirme
├── backend/              # Node.js + Express + TypeScript API
│   ├── src/utils/        # bpm.ts (Yerel DSP BPM Motoru), loudness.ts (EBU R128), silence.ts (Sessizlik Törpüleme), upload.ts
│   ├── src/scripts/      # backfillBpm.ts, backfillLoudness.ts, backfillSilence.ts (Sessizlik Migrasyonu)
│   ├── src/controller/   # Track, User, Soundkit, Comment controller'ları
│   └── src/model/        # Track, User, Soundkit mongoose modelleri
└── docker-compose.dev.yml
```

---

## 🚀 Hızlı Başlangıç

### Seçenek 1: Docker ile (Önerilen)
1. **8080** (frontend), **5000** (backend) ve **27017** (mongo) portlarının boş olduğundan emin olun.
2. Konteynerleri ayağa kaldırın:
   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```
3. Tarayıcınızda açın:
   * **Frontend:** [http://localhost:8080](http://localhost:8080)
   * **Backend API & Swagger:** [http://localhost:5000/api](http://localhost:5000/api)

---

### Seçenek 2: Yerel Geliştirme (Docker Olmadan)

#### 1. Backend Hazırlığı
```bash
cd backend
npm install
npm run dev
```

> **Mevcut Parçaların Ses Analizini (LUFS, BPM veya Sessizlik Törpüleme) Çalıştırmak İçin:**
> ```bash
> npm run loudness:backfill
> npm run bpm:backfill
> npm run silence:trim       # Sunucudaki gerçek ses dosyalarını ve HLS akışlarını törpüler
> ```

#### 2. Frontend Hazırlığı
```bash
cd frontend
npm install
npm run dev -- --host --port 8080
```
Tarayıcınızda **http://localhost:8080** adresini açın.

---

## 🎶 Neden “Chromatik”?
*Kromatik Dizi (Chromatic Scale)* tüm oktavı yarım tonluk adımlarla, hiçbir frekansı dışarıda bırakmadan kucaklar. Chromatik; üreticinin sesini kısıtlamayan, her nüansı ve tonal özgürlüğü en dinamik haliyle dinleyiciye ulaştıran yeni nesil dijital müzik vitrinidir.
