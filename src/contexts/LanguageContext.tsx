'use client'
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import bn from '@/lib/translations/bn'
import en from '@/lib/translations/en'

type Lang = 'bn' | 'en'
type Translations = typeof bn

interface LangContextType {
  lang: Lang
  t: Translations
  toggle: () => void
  setLang: (l: Lang) => void
}

const LangContext = createContext<LangContextType>({
  lang: 'bn',
  t: bn,
  toggle: () => {},
  setLang: () => {},
})

function getCookieLang(): Lang {
  if (typeof document === 'undefined') return 'bn'
  const match = document.cookie.match(/pbd_lang=(bn|en)/)
  return (match?.[1] as Lang) || 'bn'
}

function setCookieLang(lang: Lang) {
  document.cookie = `pbd_lang=${lang};path=/;max-age=${60 * 60 * 24 * 365}`
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('bn')

  useEffect(() => {
    // Read from cookie or browser language on mount
    const saved = getCookieLang()
    if (saved) {
      setLangState(saved)
    } else {
      // Auto-detect: if browser is not Bengali, default to bn still
      // (our primary market is BD)
      setLangState('bn')
    }
  }, [])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    setCookieLang(l)
  }, [])

  const toggle = useCallback(() => {
    setLang(lang === 'bn' ? 'en' : 'bn')
  }, [lang, setLang])

  const t = lang === 'en' ? en : bn

  return (
    <LangContext.Provider value={{ lang, t, toggle, setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
// Shortcut hook — most components only need t()
export const useT = () => useContext(LangContext).t
