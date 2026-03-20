import React from "react"

const CurrencyContext = React.createContext({
  addDiamonds: () => {},
  diamonds: 0,
})

export function CurrencyProvider({ children }) {
  const [diamonds, setDiamonds] = React.useState(120)

  const addDiamonds = React.useCallback((amount) => {
    setDiamonds((currentDiamonds) => currentDiamonds + amount)
  }, [])

  const value = React.useMemo(
    () => ({
      addDiamonds,
      diamonds,
    }),
    [addDiamonds, diamonds]
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
