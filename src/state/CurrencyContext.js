import React from "react"
import { levels } from "../data/levels"

const CurrencyContext = React.createContext({
  addDiamonds: () => {},
  clearedLevelIds: [],
  diamonds: 0,
  highestUnlockedLevelId: levels[0]?.id ?? "01",
  isMusicEnabled: true,
  isLevelCleared: () => false,
  isLevelUnlocked: () => false,
  markLevelCleared: () => {},
  resetGame: () => {},
  toggleMusic: () => {},
})

const INITIAL_DIAMONDS = 120
const INITIAL_CLEARED_LEVEL_IDS = []

export function CurrencyProvider({ children }) {
  const [diamonds, setDiamonds] = React.useState(INITIAL_DIAMONDS)
  const [isMusicEnabled, setIsMusicEnabled] = React.useState(true)
  const [clearedLevelIds, setClearedLevelIds] = React.useState(
    INITIAL_CLEARED_LEVEL_IDS
  )

  const addDiamonds = React.useCallback((amount) => {
    setDiamonds((currentDiamonds) => currentDiamonds + amount)
  }, [])

  const toggleMusic = React.useCallback(() => {
    setIsMusicEnabled((currentValue) => !currentValue)
  }, [])

  const markLevelCleared = React.useCallback((levelId) => {
    setClearedLevelIds((currentLevelIds) => {
      if (currentLevelIds.includes(levelId)) {
        return currentLevelIds
      }

      return [...currentLevelIds, levelId]
    })
  }, [])

  const isLevelCleared = React.useCallback(
    (levelId) => clearedLevelIds.includes(levelId),
    [clearedLevelIds]
  )

  const highestUnlockedLevelId = React.useMemo(() => {
    let highestUnlockedIndex = 0

    for (let index = 1; index < levels.length; index += 1) {
      if (!clearedLevelIds.includes(levels[index - 1].id)) {
        break
      }

      highestUnlockedIndex = index
    }

    return levels[highestUnlockedIndex]?.id ?? levels[0]?.id ?? "01"
  }, [clearedLevelIds])

  const isLevelUnlocked = React.useCallback(
    (levelId) => {
      const levelIndex = levels.findIndex((level) => level.id === levelId)

      if (levelIndex <= 0) {
        return true
      }

      return clearedLevelIds.includes(levels[levelIndex - 1].id)
    },
    [clearedLevelIds]
  )

  const resetGame = React.useCallback(() => {
    setClearedLevelIds(INITIAL_CLEARED_LEVEL_IDS)
    setDiamonds(INITIAL_DIAMONDS)
    setIsMusicEnabled(true)
  }, [])

  const value = React.useMemo(
    () => ({
      addDiamonds,
      clearedLevelIds,
      diamonds,
      highestUnlockedLevelId,
      isMusicEnabled,
      isLevelCleared,
      isLevelUnlocked,
      markLevelCleared,
      resetGame,
      toggleMusic,
    }),
    [
      addDiamonds,
      clearedLevelIds,
      diamonds,
      highestUnlockedLevelId,
      isLevelCleared,
      isLevelUnlocked,
      isMusicEnabled,
      markLevelCleared,
      resetGame,
      toggleMusic,
    ]
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
