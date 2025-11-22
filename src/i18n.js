import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en/translation.json'
import ru from './locales/ru/translation.json'
import uk from './locales/uk/translation.json'
import ka from './locales/ka/translation.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'ru', 'uk', 'ka'],
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      uk: { translation: uk },
      ka: { translation: ka },
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n


