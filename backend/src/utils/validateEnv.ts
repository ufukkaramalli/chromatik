import { cleanEnv, str, port, num } from "envalid";

function validateEnv(): void {
    cleanEnv(process.env, {
        NODE_ENV: str({
            choices: ['development','production']
        }),
        MONGO_URI: str(),
        PORT: port({ default: 5000 }),
        JWT_SECRET: str(),
        MEDIA_DIR: str({ default: '/srv/chromatik/media' }),
        TZ: str({ default: 'Europe/Istanbul' }),
        CURRENCY_PROVIDER: str({ choices: ['global', 'tcmb'], default: 'global' }),
        CURRENCY_API_URL: str({ default: 'https://open.er-api.com/v6/latest/USD' }),
        CURRENCY_API_KEY: str({ default: '' }),
        TCMB_API_URL: str({ default: 'https://www.tcmb.gov.tr/kurlar/today.xml' }),
        CURRENCY_CACHE_TTL_MINUTES: num({ default: 60 }),
        CURRENCY_FALLBACK_TRY_RATE: num({ default: 45.0 }),
        CLIENT_URL: str({ default: '' })
    })
}

export default validateEnv