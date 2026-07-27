"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"
type ResolvedTheme = Exclude<Theme, "system">

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const themeStorageKey = "theme"
const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function subscribeToSystemTheme(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

  mediaQuery.addEventListener("change", onStoreChange)

  return () => mediaQuery.removeEventListener("change", onStoreChange)
}

function getStoredTheme(): Theme {
  const storedTheme = window.localStorage.getItem(themeStorageKey)

  return storedTheme === "light" ||
    storedTheme === "dark" ||
    storedTheme === "system"
    ? storedTheme
    : "system"
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setCurrentTheme] = React.useState<Theme>(() =>
    typeof window === "undefined" ? "system" : getStoredTheme()
  )
  const systemTheme = React.useSyncExternalStore<ResolvedTheme>(
    subscribeToSystemTheme,
    getSystemTheme,
    () => "light"
  )
  const resolvedTheme = theme === "system" ? systemTheme : theme

  const setTheme = React.useCallback((nextTheme: Theme) => {
    window.localStorage.setItem(themeStorageKey, nextTheme)
    setCurrentTheme(nextTheme)
  }, [])

  React.useEffect(() => {
    const root = document.documentElement

    root.classList.toggle("dark", resolvedTheme === "dark")
    root.style.colorScheme = resolvedTheme
  }, [resolvedTheme])

  React.useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === themeStorageKey && event.newValue) {
        setCurrentTheme(
          event.newValue === "light" ||
            event.newValue === "dark" ||
            event.newValue === "system"
            ? event.newValue
            : "system"
        )
      }
    }

    window.addEventListener("storage", onStorage)

    return () => window.removeEventListener("storage", onStorage)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      <ThemeHotkey />
      {children}
    </ThemeContext.Provider>
  )
}

function useTheme() {
  const theme = React.useContext(ThemeContext)

  if (!theme) {
    throw new Error("useTheme must be used within ThemeProvider")
  }

  return theme
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.key.toLowerCase() !== "d" ||
        isTypingTarget(event.target)
      ) {
        return
      }

      event.preventDefault()
      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => window.removeEventListener("keydown", onKeyDown)
  }, [resolvedTheme, setTheme])

  return null
}

export { ThemeProvider, useTheme }
