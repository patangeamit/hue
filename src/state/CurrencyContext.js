import React from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { levels } from "../data/levels"

const CurrencyContext = React.createContext({
  addDiamonds: () => {},
  buyEnergy: () => false,
  clearedLevelIds: [],
  consumeEnergy: () => false,
  diamonds: 0,
  energy: 0,
  highestUnlockedLevelId: levels[0]?.id ?? "01",
  isMusicEnabled: true,
  isLevelCleared: () => false,
  isLevelUnlocked: () => false,
  maxEnergy: 0,
  markLevelCleared: () => {},
  rechargeSecondsRemaining: 0,
  resetGame: () => {},
  toggleMusic: () => {},
})

const INITIAL_DIAMONDS = 120
const INITIAL_CLEARED_LEVEL_IDS = []
const STORAGE_KEY = "hue.currency-state"
const INITIAL_HIGHEST_UNLOCKED_LEVEL_ID = levels[0]?.id ?? "01"
const MAX_ENERGY = 5
const ENERGY_RECHARGE_INTERVAL_MS = 15 * 60 * 1000
const ENERGY_PURCHASE_COST = 25
const INITIAL_STATE = {
  clearedLevelIds: INITIAL_CLEARED_LEVEL_IDS,
  diamonds: INITIAL_DIAMONDS,
  energy: MAX_ENERGY,
  highestUnlockedLevelId: INITIAL_HIGHEST_UNLOCKED_LEVEL_ID,
  isMusicEnabled: true,
  lastEnergyRefillAt: Date.now(),
}
const DEBUG_PREFIX = "[CurrencyContext]"

function getHighestUnlockedLevelId(clearedLevelIds) {
  let highestUnlockedIndex = 0

  for (let index = 1; index < levels.length; index += 1) {
    if (!clearedLevelIds.includes(levels[index - 1].id)) {
      break
    }

    highestUnlockedIndex = index
  }

  return levels[highestUnlockedIndex]?.id ?? INITIAL_HIGHEST_UNLOCKED_LEVEL_ID
}

function sanitizeState(parsedState) {
  const validLevelIds = new Set(levels.map((level) => level.id))
  const clearedLevelIds = Array.isArray(parsedState?.clearedLevelIds)
    ? parsedState.clearedLevelIds.filter((levelId) => validLevelIds.has(levelId))
    : INITIAL_CLEARED_LEVEL_IDS
  const derivedHighestUnlockedLevelId = getHighestUnlockedLevelId(clearedLevelIds)
  const storedHighestUnlockedLevelId = validLevelIds.has(parsedState?.highestUnlockedLevelId)
    ? parsedState.highestUnlockedLevelId
    : derivedHighestUnlockedLevelId
  const derivedHighestUnlockedIndex = levels.findIndex(
    (level) => level.id === derivedHighestUnlockedLevelId
  )
  const storedHighestUnlockedIndex = levels.findIndex(
    (level) => level.id === storedHighestUnlockedLevelId
  )

  return {
    clearedLevelIds,
    diamonds:
      typeof parsedState?.diamonds === "number"
        ? parsedState.diamonds
        : INITIAL_DIAMONDS,
    energy:
      typeof parsedState?.energy === "number"
        ? Math.max(0, Math.min(MAX_ENERGY, Math.floor(parsedState.energy)))
        : MAX_ENERGY,
    highestUnlockedLevelId:
      levels[Math.max(derivedHighestUnlockedIndex, storedHighestUnlockedIndex)]?.id ??
      INITIAL_HIGHEST_UNLOCKED_LEVEL_ID,
    isMusicEnabled:
      typeof parsedState?.isMusicEnabled === "boolean"
        ? parsedState.isMusicEnabled
        : true,
    lastEnergyRefillAt:
      typeof parsedState?.lastEnergyRefillAt === "number"
        ? parsedState.lastEnergyRefillAt
        : Date.now(),
  }
}

function applyEnergyRecharge(currentState, now = Date.now()) {
  const sanitizedState = sanitizeState(currentState)

  if (sanitizedState.energy >= MAX_ENERGY) {
    return {
      ...sanitizedState,
      energy: MAX_ENERGY,
      lastEnergyRefillAt: now,
    }
  }

  const elapsedMs = Math.max(0, now - sanitizedState.lastEnergyRefillAt)
  const restoredEnergy = Math.floor(elapsedMs / ENERGY_RECHARGE_INTERVAL_MS)

  if (restoredEnergy <= 0) {
    return sanitizedState
  }

  const nextEnergy = Math.min(MAX_ENERGY, sanitizedState.energy + restoredEnergy)

  return {
    ...sanitizedState,
    energy: nextEnergy,
    lastEnergyRefillAt:
      nextEnergy >= MAX_ENERGY
        ? now
        : sanitizedState.lastEnergyRefillAt + restoredEnergy * ENERGY_RECHARGE_INTERVAL_MS,
  }
}

function getRechargeSecondsRemaining(currentState, now = Date.now()) {
  const rechargedState = applyEnergyRecharge(currentState, now)

  if (rechargedState.energy >= MAX_ENERGY) {
    return 0
  }

  return Math.max(
    0,
    Math.ceil(
      (rechargedState.lastEnergyRefillAt + ENERGY_RECHARGE_INTERVAL_MS - now) / 1000
    )
  )
}

export function CurrencyProvider({ children }) {
  const [state, setState] = React.useState(INITIAL_STATE)
  const [hasHydrated, setHasHydrated] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(Date.now())

  const persistState = React.useCallback(async (nextState) => {
    try {
      console.log(`${DEBUG_PREFIX} persisting state`, nextState)
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextState))
      console.log(`${DEBUG_PREFIX} persisted state successfully`)
    } catch (error) {
      console.warn("Unable to save currency state", error)
    }
  }, [])

  React.useEffect(() => {
    let isMounted = true

    const hydrateState = async () => {
      try {
        console.log(`${DEBUG_PREFIX} hydrating from storage key`, STORAGE_KEY)
        const storedValue = await AsyncStorage.getItem(STORAGE_KEY)
        console.log(`${DEBUG_PREFIX} raw stored value`, storedValue)

        if (!storedValue || !isMounted) {
          console.log(`${DEBUG_PREFIX} no stored value found, using initial state`)
          return
        }

        const parsedState = JSON.parse(storedValue)
        const sanitizedState = sanitizeState(parsedState)
        console.log(`${DEBUG_PREFIX} sanitized hydrated state`, sanitizedState)

        if (isMounted) {
          setState(sanitizedState)
        }
      } catch (error) {
        console.warn("Unable to load saved currency state", error)
      } finally {
        if (isMounted) {
          console.log(`${DEBUG_PREFIX} hydration complete`)
          setHasHydrated(true)
        }
      }
    }

    hydrateState()

    return () => {
      isMounted = false
    }
  }, [])

  React.useEffect(() => {
    if (!hasHydrated) {
      return
    }

    console.log(`${DEBUG_PREFIX} post-hydration sync`, state)
    persistState(state)
  }, [hasHydrated, persistState, state])

  React.useEffect(() => {
    if (!hasHydrated) {
      return undefined
    }

    const intervalId = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => clearInterval(intervalId)
  }, [hasHydrated])

  const updateState = React.useCallback(
    (updater) => {
      setState((currentState) => {
        console.log(`${DEBUG_PREFIX} current state before update`, currentState)
        const nextState = sanitizeState(
          typeof updater === "function" ? updater(currentState) : updater
        )
        console.log(`${DEBUG_PREFIX} next state after update`, nextState)

        if (hasHydrated) {
          persistState(nextState)
        }

        return nextState
      })
    },
    [hasHydrated, persistState]
  )

  const addDiamonds = React.useCallback((amount) => {
    updateState((currentState) => ({
      ...currentState,
      diamonds: currentState.diamonds + amount,
    }))
  }, [updateState])

  const buyEnergy = React.useCallback(() => {
    if (resolvedState.energy >= MAX_ENERGY || resolvedState.diamonds < ENERGY_PURCHASE_COST) {
      console.log(`${DEBUG_PREFIX} unable to buy energy`, resolvedState)
      return false
    }

    updateState((currentState) => {
      const now = Date.now()
      const rechargedState = applyEnergyRecharge(currentState, now)

      if (
        rechargedState.energy >= MAX_ENERGY ||
        rechargedState.diamonds < ENERGY_PURCHASE_COST
      ) {
        return rechargedState
      }

      return {
        ...rechargedState,
        diamonds: rechargedState.diamonds - ENERGY_PURCHASE_COST,
        energy: rechargedState.energy + 1,
        lastEnergyRefillAt:
          rechargedState.energy + 1 >= MAX_ENERGY ? now : rechargedState.lastEnergyRefillAt,
      }
    })

    return true
  }, [resolvedState, updateState])

  const toggleMusic = React.useCallback(() => {
    updateState((currentState) => ({
      ...currentState,
      isMusicEnabled: !currentState.isMusicEnabled,
    }))
  }, [updateState])

  const markLevelCleared = React.useCallback((levelId) => {
    console.log(`${DEBUG_PREFIX} markLevelCleared called`, levelId)
    updateState((currentState) => {
      if (currentState.clearedLevelIds.includes(levelId)) {
        console.log(`${DEBUG_PREFIX} level already cleared`, levelId)
        return currentState
      }

      const nextClearedLevelIds = [...currentState.clearedLevelIds, levelId]
      const nextHighestUnlockedLevelId = getHighestUnlockedLevelId(nextClearedLevelIds)

      console.log(`${DEBUG_PREFIX} clearing level`, {
        levelId,
        nextClearedLevelIds,
        nextHighestUnlockedLevelId,
      })

      return {
        ...currentState,
        clearedLevelIds: nextClearedLevelIds,
        highestUnlockedLevelId: nextHighestUnlockedLevelId,
      }
    })
  }, [updateState])

  const isLevelCleared = React.useCallback(
    (levelId) => state.clearedLevelIds.includes(levelId),
    [state.clearedLevelIds]
  )

  const resolvedState = React.useMemo(
    () => applyEnergyRecharge(state, currentTime),
    [currentTime, state]
  )
  const highestUnlockedLevelId = resolvedState.highestUnlockedLevelId
  const rechargeSecondsRemaining = React.useMemo(
    () => getRechargeSecondsRemaining(state, currentTime),
    [currentTime, state]
  )

  const consumeEnergy = React.useCallback(() => {
    if (resolvedState.energy <= 0) {
      console.log(`${DEBUG_PREFIX} unable to consume energy`, resolvedState)
      return false
    }

    updateState((currentState) => {
      const now = Date.now()
      const rechargedState = applyEnergyRecharge(currentState, now)

      return {
        ...rechargedState,
        energy: rechargedState.energy - 1,
        lastEnergyRefillAt:
          rechargedState.energy >= MAX_ENERGY ? now : rechargedState.lastEnergyRefillAt,
      }
    })

    return true
  }, [resolvedState, updateState])

  const isLevelUnlocked = React.useCallback(
    (levelId) => {
      const levelIndex = levels.findIndex((level) => level.id === levelId)
      const highestUnlockedIndex = levels.findIndex(
        (level) => level.id === resolvedState.highestUnlockedLevelId
      )

      return levelIndex !== -1 && levelIndex <= highestUnlockedIndex
    },
    [resolvedState.highestUnlockedLevelId]
  )

  const resetGame = React.useCallback(() => {
    updateState(INITIAL_STATE)
  }, [updateState])

  const value = React.useMemo(
    () => ({
      addDiamonds,
      buyEnergy,
      clearedLevelIds: state.clearedLevelIds,
      consumeEnergy,
      diamonds: resolvedState.diamonds,
      energy: resolvedState.energy,
      highestUnlockedLevelId,
      isMusicEnabled: state.isMusicEnabled,
      isLevelCleared,
      isLevelUnlocked,
      maxEnergy: MAX_ENERGY,
      markLevelCleared,
      rechargeSecondsRemaining,
      resetGame,
      toggleMusic,
    }),
    [
      addDiamonds,
      buyEnergy,
      consumeEnergy,
      highestUnlockedLevelId,
      isLevelCleared,
      isLevelUnlocked,
      markLevelCleared,
      rechargeSecondsRemaining,
      resetGame,
      state.clearedLevelIds,
      state.isMusicEnabled,
      toggleMusic,
      resolvedState.diamonds,
      resolvedState.energy,
    ]
  )

  if (!hasHydrated) {
    return null
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return React.useContext(CurrencyContext)
}
