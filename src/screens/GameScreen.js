import React, { useMemo, useState } from "react"
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import PuzzleBoard, { createSolvedTiles } from "../components/PuzzleBoard"
import TopSheetMenu from "../components/TopSheetMenu"
import { getLevelById, levels } from "../data/levels"
import { useCurrency } from "../state/CurrencyContext"

function randomIndex(max) {
  return Math.floor(Math.random() * max)
}

function createPuzzleTiles(tiles, swapCount = 10) {
  const nextTiles = [...tiles]
  const movableIndexes = nextTiles
    .map((tile, index) => (tile.isFixed ? null : index))
    .filter((index) => index !== null)

  for (let turn = 0; turn < swapCount; turn += 1) {
    const firstPoolIndex = randomIndex(movableIndexes.length)
    let secondPoolIndex = randomIndex(movableIndexes.length)

    while (secondPoolIndex === firstPoolIndex) {
      secondPoolIndex = randomIndex(movableIndexes.length)
    }

    const firstIndex = movableIndexes[firstPoolIndex]
    const secondIndex = movableIndexes[secondPoolIndex]
    ;[nextTiles[firstIndex], nextTiles[secondIndex]] = [
      nextTiles[secondIndex],
      nextTiles[firstIndex],
    ]
  }

  const isStillSolved = nextTiles.every(
    (tile, index) => tile.correctIndex === index
  )

  return isStillSolved ? createPuzzleTiles(tiles, swapCount) : nextTiles
}

function swapTiles(tiles, firstIndex, secondIndex) {
  const nextTiles = [...tiles]
  ;[nextTiles[firstIndex], nextTiles[secondIndex]] = [
    nextTiles[secondIndex],
    nextTiles[firstIndex],
  ]
  return nextTiles
}

function isSolved(tiles) {
  return tiles.every((tile, index) => tile.correctIndex === index)
}

export default function GameScreen({ navigation, route }) {
  const {
    addDiamonds,
    diamonds,
    highestUnlockedLevelId,
    isMusicEnabled,
    isLevelUnlocked,
    markLevelCleared,
    toggleMusic,
  } = useCurrency()
  const requestedLevelId = route.params?.levelId ?? levels[0].id
  const resolvedLevelId = useMemo(() => {
    if (isLevelUnlocked(requestedLevelId)) {
      return requestedLevelId
    }

    return highestUnlockedLevelId
  }, [highestUnlockedLevelId, isLevelUnlocked, requestedLevelId])
  const level = useMemo(() => getLevelById(resolvedLevelId), [resolvedLevelId])
  const solvedTiles = useMemo(
    () => createSolvedTiles(level.size, level.corners),
    [level]
  )
  const [initialTiles, setInitialTiles] = useState(() => solvedTiles)
  const [tiles, setTiles] = useState(solvedTiles)
  const [started, setStarted] = useState(false)
  const [showWinScreen, setShowWinScreen] = useState(false)
  const [rewardGranted, setRewardGranted] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(null)

  React.useEffect(() => {
    setInitialTiles(solvedTiles)
    setTiles(solvedTiles)
    setStarted(false)
    setShowWinScreen(false)
    setRewardGranted(false)
    setSelectedIndex(null)
  }, [level, solvedTiles])

  React.useEffect(() => {
    if (started && isSolved(tiles) && !rewardGranted) {
      const timeoutId = setTimeout(() => {
        addDiamonds(level.reward)
        markLevelCleared(level.id)
        setRewardGranted(true)
        setShowWinScreen(true)
      }, 4000)

      return () => clearTimeout(timeoutId)
    }

    return undefined
  }, [addDiamonds, level.id, level.reward, markLevelCleared, rewardGranted, started, tiles])

  const handleTileSwap = (fromIndex, toIndex) => {
    if (!started) {
      return
    }

    if (tiles[fromIndex].isFixed || tiles[toIndex].isFixed) {
      return
    }

    setTiles((currentTiles) => swapTiles(currentTiles, fromIndex, toIndex))
    setSelectedIndex(null)
  }

  const handleStart = () => {
    const nextPuzzle = createPuzzleTiles(solvedTiles, level.swapCount)
    setInitialTiles(nextPuzzle)
    setTiles(nextPuzzle)
    setStarted(true)
    setShowWinScreen(false)
    setRewardGranted(false)
    setSelectedIndex(null)
  }

  const handleShuffle = () => {
    const nextPuzzle = createPuzzleTiles(solvedTiles, level.swapCount)
    setInitialTiles(nextPuzzle)
    setTiles(nextPuzzle)
    setStarted(true)
    setShowWinScreen(false)
    setRewardGranted(false)
    setSelectedIndex(null)
  }

  const handleTileTap = (index) => {
    if (!started || tiles[index].isFixed) {
      return
    }

    if (selectedIndex === null) {
      setSelectedIndex(index)
      return
    }

    if (selectedIndex === index) {
      setSelectedIndex(null)
      return
    }

    if (tiles[selectedIndex]?.isFixed) {
      setSelectedIndex(null)
      return
    }

    setTiles((currentTiles) => swapTiles(currentTiles, selectedIndex, index))
    setSelectedIndex(null)
  }

  const menuSettings = [
    {
      label: "Sound",
      onPress: toggleMusic,
      value: isMusicEnabled,
    },
  ]

  const menuPrimaryActions = [
    {
      label: "Shuffle",
      onPress: handleShuffle,
    },
    {
      label: "Back To Levels",
      onPress: () => {
        if (navigation.canGoBack()) {
          navigation.goBack()
          return
        }

        navigation.navigate("LevelSelect")
      },
    },
  ]

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.menuWrap}>
          <TopSheetMenu
            onPlusPress={handleShuffle}
            primaryActions={menuPrimaryActions}
            secondaryAction={{ label: "Close" }}
            settings={menuSettings}
            stats={[
              { color: "#E59A9E", icon: "heart-outline", value: 31 },
              { color: "#64A8D8", icon: "diamond-outline", value: diamonds },
            ]}
            title={`Scholar ${Number(resolvedLevelId)}`}
          />
        </View>

        <View style={styles.boardSection}>
          <PuzzleBoard
            isWon={isSolved(tiles) && started}
            onTileSwap={handleTileSwap}
            onTileTap={handleTileTap}
            selectedTileId={selectedIndex === null ? null : tiles[selectedIndex]?.id}
            size={level.size}
            tiles={tiles}
          />

          {!started ? (
            <View style={styles.startDock}>
              <Pressable
                onPress={() => {
                  if (navigation.canGoBack()) {
                    navigation.goBack()
                    return
                  }

                  navigation.navigate("LevelSelect")
                }}
                style={({ pressed }) => [
                  styles.startButton,
                  pressed && styles.startButtonPressed,
                ]}
              >
                <Text style={styles.startButtonLabel}>Levels</Text>
              </Pressable>
              <Pressable
                onPress={handleStart}
                style={({ pressed }) => [
                  styles.startButton,
                  pressed && styles.startButtonPressed,
                ]}
              >
                <Text style={styles.startButtonLabel}>Start</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>

      <Modal
        animationType="fade"
        onRequestClose={() => setShowWinScreen(false)}
        transparent
        visible={showWinScreen}
      >
        <View style={styles.winOverlay}>
          <View style={styles.winCard}>
            <Text style={styles.winEyebrow}>Level Complete</Text>
            <Text style={styles.winTitle}>{level.name}</Text>
            <Text style={styles.winText}>
              The gradient is back in harmony. You earned {level.reward} diamonds.
            </Text>
            <Pressable
              onPress={() => {
                setShowWinScreen(false)
                if (navigation.canGoBack()) {
                  navigation.goBack()
                  return
                }

                navigation.navigate("LevelSelect")
              }}
              style={({ pressed }) => [
                styles.winPrimaryButton,
                pressed && styles.winButtonPressed,
              ]}
            >
              <Text style={styles.winPrimaryLabel}>Back To Levels</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setShowWinScreen(false)
                handleShuffle()
              }}
              style={({ pressed }) => [
                styles.winSecondaryButton,
                pressed && styles.winButtonPressed,
              ]}
            >
              <Text style={styles.winSecondaryLabel}>Shuffle Again</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#191218",
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  menuWrap: {
    alignItems: "center",
    position: "absolute",
    right: 20,
    top: 10,
    zIndex: 20,
  },
  boardSection: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingBottom: 18,
    width: "100%",
  },
  startDock: {
    alignItems: "center",
    bottom: 18,
    flexDirection: "row",
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
  },
  startButton: {
    alignItems: "center",
    backgroundColor: "#F4EEDB",
    borderRadius: 999,
    justifyContent: "center",
    marginHorizontal: 10,
    minWidth: 160,
    paddingHorizontal: 28,
    paddingVertical: 15,
  },
  startButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  startButtonLabel: {
    color: "#1B141A",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  winOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(13, 10, 14, 0.52)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  winCard: {
    alignItems: "center",
    backgroundColor: "rgba(29,22,28,0.98)",
    borderRadius: 30,
    paddingHorizontal: 28,
    paddingVertical: 30,
    width: "100%",
  },
  winEyebrow: {
    color: "#BFB6AF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  winTitle: {
    color: "#F4EEDB",
    fontSize: 28,
    fontWeight: "500",
    marginTop: 10,
  },
  winText: {
    color: "#BFB6AF",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    marginTop: 10,
    textAlign: "center",
  },
  winPrimaryButton: {
    backgroundColor: "rgba(244,238,219,0.12)",
    borderRadius: 999,
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 14,
    width: "100%",
  },
  winPrimaryLabel: {
    color: "#F4EEDB",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.6,
    textAlign: "center",
    textTransform: "uppercase",
  },
  winSecondaryButton: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  winSecondaryLabel: {
    color: "#BFB6AF",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  winButtonPressed: {
    opacity: 0.82,
  },
})
