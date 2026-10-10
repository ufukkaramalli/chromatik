---
description: Rules for cart, regional pricing, currency exchange, and audio licensing
globs: /srv/chromatik/app/**/*
---

# Commerce, Cart, and Regional Pricing Rules

When developing or modifying features related to tracks, soundkits, cart, licensing, pricing, or currency conversion in both backend and frontend, you MUST STRICTLY follow these architectural rules:

## 1. Universal Base Currency is USD ($)
- **Database & Model Storage**: All item prices in MongoDB (`Track`, `Soundkit`, `CartItem`, etc.) MUST ALWAYS be stored in **USD ($)** (`priceBasic`, `pricePremium`, `priceUnlimited`, `priceExclusive`, `price`).
- **Never Store Converted TRY Values as Base Price**: Never store pre-calculated Turkish Lira or foreign currency amounts in track or product documents. Currency conversion is strictly dynamic at query/checkout time.

## 2. Dynamic Currency Conversion & Formatting (`currencyStore`)
- **No Ad-Hoc Math in Components**: Never multiply prices by arbitrary or hardcoded exchange rates (`price * 49`, etc.) inside Vue components or scripts.
- **Use `currencyStore` Methods**:
  - `currencyStore.formatPrice(usdAmount, forceCurrency?)` for formatted single currency strings (e.g. `₺1.434,93` or `$29.00`).
  - `currencyStore.formatDualPrice(usdAmount)` when displaying local currency alongside international reference price (e.g. `₺1.434,93 ($29.00)`).
- **Dynamic Source in Localization**: The FX exchange rate provider notice MUST NEVER be hardcoded to a specific vendor (such as "TCMB"). Use dynamic translations `$t('Cart.CurrencyNotice', { source: currencyStore.sourceLabel })` so it automatically reflects whether rates are fetched from Global FX, TCMB, or cached fallbacks.

## 3. Cart & Licensing Component Architecture
- **Centralized Cart Store**: All cart mutations (add, remove, clear, license switch, guest-to-user sync) MUST pass through `useCartStore` (`@/stores/cartStore.ts`). Never write ad-hoc cart logic in views or components.
- **Reusable License Selector**: For choosing track lease tiers (Basic, Premium, Unlimited, Exclusive), always use the standard `LicenseSelectorModal.vue` (`@/components/Cart/LicenseSelectorModal.vue`) or standard tier cards in `TrackPage.vue`.
- **Adhere to `audio_components.md`**: Do NOT recreate custom track cards or player layouts to add buy buttons. Always integrate purchase triggers through the standard price chip overlay in `BoxPlayer.vue`.

## 4. Axios BaseURL Rule (No Double `/api` Prefix)
- The centralized Axios client in `@/lib/axios.ts` already has its `baseURL` set to `/api` (or environment `API_BASE_URL`).
- **Never prefix endpoints with `/api`**: Always call `api.get('/cart')`, `api.post('/cart/items')`, `api.get('/currency/rates')`. Writing `api.get('/api/cart')` will result in `/api/api/cart` (404 Not Found).

## 5. External Services Must Be Environment-Driven
- **Zero Hardcoded Endpoints/Keys**: Never hardcode exchange rate URLs, API keys, fallback rates, or payment gateway endpoints statically in backend code.
- **Always Validate in `validateEnv.ts`**: Any external provider configurations MUST be documented in `.env.example`, `.env.development`, and added to `validateEnv.ts` using `envalid`.

## 6. Turkish E-Commerce & 32 Sayılı Karar Compliance (Checkout)
- **Settlement vs. Display**: Displaying reference USD prices is permissible and encouraged for international UX. However, during Checkout/Payment:
  - If the buyer's billing address is **Turkey** or paying with a **domestic Turkish card**, settlement MUST strictly be executed in **Turkish Lira (TRY)** at the active central bank rate.
  - If the buyer is international (foreign card/country), settlement is executed in **USD/EUR**.
