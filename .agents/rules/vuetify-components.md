---
trigger: always_on
description: Proje genelinde yerel HTML/CSS yerine daima Vuetify bileşenlerinin ve yardımcı sınıflarının kullanılmasını zorunlu kılar.
---

# Vuetify-First UI Development Rule

Frontend (`/srv/chromatik/app/frontend` veya `frontend/`) kapsamında geliştirme veya düzenleme yaparken, **MECBUR KALINMADIĞI SÜRECE ASLA YEREL (NATIVE) HTML ELEMANLARI VE ÖZEL CSS KULLANILMAYACAK, DAİMA VUETIFY 3 BİLEŞENLERİ KULLANILACAKTIR.**

---

### 1. Temel İlke (Vuetify-First)
* Özel HTML etiketleri (`<button>`, `<input>`, `<div class="card">`, `<span class="badge">`, `<hr>` vb.) ve bu etiketler için sıfırdan CSS yazmak **kesinlikle yasaktır**.
* Yalnızca zorunlu teknik durumlar (örneğin `<canvas>` çizimleri, karmaşık SVG yolları veya özel üçüncü parti kütüphane entegrasyonları) haricinde her UI öğesi Vuetify karşılığı ile inşa edilmelidir.

---

### 2. Standart Bileşen Eşleştirmeleri
Yerel HTML/Özel div yerine mutlaka şu Vuetify bileşenleri kullanılmalıdır:

| Yerel / Özel Eleman | Kullanılması Zorunlu Vuetify Bileşeni |
| :--- | :--- |
| `<button>`, özel tıklanabilir div | `<v-btn>` (variant: `flat`, `tonal`, `outlined`, `text` vb.) |
| `<input type="text">`, arama kutusu | `<v-text-field>` (slotlar: `#prepend-inner`, `#append-inner`) |
| `<select>`, dropdown | `<v-select>`, `<v-autocomplete>` |
| Özel kart kutuları (`.card`, `.box`) | `<v-card>`, `<v-sheet>` (prop: `border`, `elevation`, `rounded`, `color`) |
| Özel etiketler, sayaçlar, pill kutuları | `<v-chip>`, `<v-badge>` |
| Profil resimleri, ikon çevreleyicileri | `<v-avatar>` |
| Ayırıcı çizgiler (`<hr>`, `.divider`) | `<v-divider>` |
| Grid & Düzen sarmalayıcıları | `<v-container>`, `<v-row>`, `<v-col>`, `<v-spacer>` |
| Modal & Açılır pencereler | `<v-dialog>`, `<v-menu>`, `<v-bottom-sheet>` |
| Bilgi baloncukları (Tooltip) | `<GlassTooltip>` (özel CSS yazılmaz, küresel bileşen kullanılır) |
| Yükleme göstergeleri | `<v-progress-circular>`, `<v-progress-linear>`, `<v-skeleton-loader>` |

---

### 3. CSS Yazımı Yerine Vuetify Utility Sınıfları
Aşağıdaki durumlar için `<style>` bloğunda yeni CSS yazılmayacak, Vuetify'ın yerleşik yardımcı sınıfları kullanılacaktır:
* **Boşluklar:** `pa-*`, `px-*`, `py-*`, `ma-*`, `mb-*`, `mt-*` vb.
* **Flex & Hizalama:** `d-flex`, `align-center`, `justify-space-between`, `flex-wrap`, `gap-*`, `flex-grow-1` vb.
* **Kenarlık ve Yuvarlaklık:** `border`, `border-b`, `border-t`, `border-opacity-*`, `rounded-lg`, `rounded-xl`, `rounded-pill` vb.
* **Görsel Durumlar:** `elevation-*`, `hover` (v-card prop'u), `bg-surface`, `bg-surface-light`, `text-primary`, `text-grey-lighten-2` vb.

---

### 4. Özel CSS'e İzin Verilen İstisnai Durumlar
Yalnızca Vuetify prop veya sınıfları ile karşılanamayan şu durumlar için minimal CSS yazılabilir:
1. Sonsuz marquee kaydırma, osiloskop zıplama gibi `@keyframes` animasyonları.
2. `WaveField` / `FlowField` canvas z-index, absolute konumlandırma ve radial gradient arka plan sisleri (`filter: blur(...)`).
3. Çok özel cam buğusu (`backdrop-filter`) efektleri.

---

### 5. Vuetify MCP Kullanımı
Bileşenlerin desteklediği prop'lar, slot'lar ve event'ler hakkında şüpheye düşüldüğünde veya en güncel Vuetify 3 API'si gerektiğinde, projeye kurulu olan **Vuetify MCP** (`get_component_api_by_version`, `get_directive_api_by_version`) araçlarına başvurulmalıdır.
