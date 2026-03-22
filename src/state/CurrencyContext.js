import React from "react"

const CurrencyContext = React.createContext({
  addDiamonds: () => {},
  diamonds: 0,
  isMusicEnabled: true,
  resetGame: () => {},
  toggleMusic: () => {},
})

const INITIAL_DIAMONDS = 120

export function CurrencyProvider({ children }) {
  const [diamonds, setDiamonds] = React.useState(INITIAL_DIAMONDS)
  const [isMusicEnabled, setIsMusicEnabled] = React.useState(true)

  const addDiamonds = React.useCallback((amount) => {
    setDiamonds((currentDiamonds) => currentDiamonds + amount)
  }, [])

  const toggleMusic = React.useCallback(() => {
    setIsMusicEnabled((currentValue) => !currentValue)
  }, [])

  const resetGame = React.useCallback(() => {
    setDiamonds(INITIAL_DIAMONDS)
    setIsMusicEnabled(true)
  }, [])

  const value = React.useMemo(
    () => ({
      addDiamonds,
      diamonds,
      isMusicEnabled,
      resetGame,
      toggleMusic,
    }),
    [addDiamonds, diamonds, isMusicEnabled, resetGame, toggleMusic]
  )

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return React.useContext(CurrencyContext)
}
