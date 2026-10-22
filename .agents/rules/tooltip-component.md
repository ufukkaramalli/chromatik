---
trigger: always_on
description: Proje genelinde doğrudan <v-tooltip> ve özel tooltip CSS'i yazılması yerine daima standart GlassTooltip bileşeninin kullanılmasını zorunlu kılar.
---

# Reusable GlassTooltip Component Rule

Frontend (`frontend/` veya `/srv/chromatik/app/frontend`) kapsamında geliştirme veya düzenleme yaparken, **BİLGİ BALONCUĞU (TOOLTIP) KULLANILACAĞI ZAMAN ASLA ÇIPLAK `<v-tooltip>` VE ÖZEL CSS YAZILMAYACAK, DAİMA KÜRESEL `GlassTooltip` BİLEŞENİ KULLANILACAKTIR.**

---

### 1. Temel İlke
* Herhangi bir buton, ikon, badge veya metin üzerinde tooltip gösterilmesi gerektiğinde doğrudan `<v-tooltip>` yazıp ardından `.tooltip-body`, `content-class` veya özel cam buğusu (`backdrop-filter`) CSS stilleri tanımlamak **kesinlikle yasaktır**.
* Tüm tooltip ihtiyaçları için projeye küresel (`main.js`) olarak kaydedilmiş olan `<GlassTooltip />` bileşeni kullanılmalıdır. `import` edilmesine gerek yoktur.

---

### 2. Standart Kullanım Örnekleri

#### A. Basit Metin ve İkonlu Kullanım (Önerilen)
```html
<!-- Varsayılan olarak ebeveyn öğeye bağlanır (activator="parent") -->
<v-btn icon>
  <v-icon>mdi-help-circle-outline</v-icon>
  <GlassTooltip icon="mdi-information-outline" :text="$t('General.Help')" />
</v-btn>
```

#### B. Başlıklı Kullanım
```html
<GlassTooltip
  title="Loudness Normalization"
  icon="mdi-volume-equal"
  :text="$t('Player.Settings.NormalizationDesc')"
/>
```

#### C. Özel İçerik / Slot Kullanımı
İçeride birden fazla satır, dinamik veri veya özel formatlama gerektiğinde varsayılan slot kullanılır:
```html
<GlassTooltip location="top" :offset="10">
  <div class="d-flex flex-column ga-1">
    <span class="font-weight-bold text-white">{{ item.name }}</span>
    <span class="text-caption text-grey-lighten-1">{{ item.description }}</span>
  </div>
</GlassTooltip>
```

---

### 3. Desteklenen Parametreler (Props)
| Prop | Tip | Varsayılan | Açıklama |
| :--- | :--- | :--- | :--- |
| `text` | `String` | `''` | Tooltip mesaj metni |
| `title` | `String` | `''` | Üst kalın başlık |
| `icon` | `String` | `''` | Başlık veya metin solundaki MDI ikon adı (örn: `mdi-clock-outline`) |
| `iconColor` | `String` | `'primary'` | İkon rengi (Vuetify tema rengi veya hex) |
| `location` | `String` | `'top'` | Konum (`top`, `bottom`, `start`, `end`) |
| `offset` | `Number / String` | `8` | Elemanla arasındaki piksel boşluğu |
| `openDelay` | `Number / String` | `100` | Açılma gecikmesi (ms) |
| `activator` | `String` | `'parent'` | Tetikleyici modu (`parent` veya `#activator` slotu) |
| `maxWidth` | `Number / String` | `280` | Azami genişlik (px) |
