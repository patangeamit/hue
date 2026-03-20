import React, { useMemo, useState } from "react"
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import ControlButton from "../components/ControlButton"
import LevelCard from "../components/LevelCard"
import PuzzleBoard, { createSolvedTiles } from "../components/PuzzleBoard"
import { getLevelById, levels } from "../data/levels"
import { useCurrency } from "../state/CurrencyContext"
import { palette } from "../theme/colors"

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

function findHintTileId(tiles) {
  const mismatch = tiles.find((tile, index) => tile.correctIndex !== index)
  return mismatch ? mismatch.id : null
}

function isSolved(tiles) {
  return tiles.every((tile, index) => tile.correctIndex === index)
}

function IconAction({ icon, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}
    >
      <Ionicons color={palette.textPrimary} name={icon} size={20} />
    </Pressable>
  )
}

function DiamondBadge({ amount }) {
  return (
    <View style={styles.diamondBadge}>
      <Ionicons color="#64A8D8" name="diamond-outline" size={16} />
      <Text style={styles.diamondText}>{amount}</Text>
    </View>
  )
}

export default function HomeScreen({ navigation, route }) {
  const { addDiamonds, diamonds } = useCurrency()
  const levelId = route.params?.levelId ?? levels[0].id
  const level = useMemo(() => getLevelById(levelId), [levelId])
  const solvedTiles = useMemo(
    () => createSolvedTiles(level.size, level.corners),
    [level]
  )
  const [initialTiles, setInitialTiles] = useState(() => solvedTiles)
  const [tiles, setTiles] = useState(solvedTiles)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [hintedTileId, setHintedTileId] = useState(null)
  const [history, setHistory] = useState([])
  const [started, setStarted] = useState(false)
  const [showWinScreen, setShowWinScreen] = useState(false)
  const [rewardGranted, setRewardGranted] = useState(false)

  React.useEffect(() => {
    setInitialTiles(solvedTiles)
    setTiles(solvedTiles)
    setSelectedIndex(null)
    setHintedTileId(null)
    setHistory([])
    setStarted(false)
    setShowWinScreen(false)
    setRewardGranted(false)
  }, [level, solvedTiles])

  React.useEffect(() => {
    if (started && isSolved(tiles) && !rewardGranted) {
      addDiamonds(level.reward)
      setRewardGranted(true)
      setShowWinScreen(true)
    }
  }, [addDiamonds, level.reward, rewardGranted, started, tiles])

  const progress = useMemo(() => {
    const orderedCount = tiles.filter(
      (tile, index) => tile.correctIndex === index
    ).length

    return Math.round((orderedCount / tiles.length) * 100)
  }, [tiles])

  const handleTilePress = (index) => {
    if (!started) {
      return
    }

    if (tiles[index].isFixed) {
      return
    }

    setHintedTileId(null)

    if (selectedIndex === null) {
      setSelectedIndex(index)
      return
    }

    if (selectedIndex === index) {
      setSelectedIndex(null)
      return
    }
    setHistory((currentHistory) => [...currentHistory, tiles])
    setTiles((currentTiles) => swapTiles(currentTiles, selectedIndex, index))
    setSelectedIndex(null)
  }

  const handleReset = () => {
    setHistory([])
    setSelectedIndex(null)
    setHintedTileId(null)
    setStarted(false)
    setShowWinScreen(false)
    setRewardGranted(false)
    setTiles([...initialTiles])
  }

  const handleStart = () => {
    const nextPuzzle = createPuzzleTiles(solvedTiles, level.swapCount)
    setHistory([])
    setSelectedIndex(null)
    setHintedTileId(null)
    setInitialTiles(nextPuzzle)
    setTiles(nextPuzzle)
    setStarted(true)
    setShowWinScreen(false)
    setRewardGranted(false)
  }

  const handleShuffle = () => {
    const nextPuzzle = createPuzzleTiles(solvedTiles, level.swapCount)
    setHistory([])
    setSelectedIndex(null)
    setHintedTileId(null)
    setInitialTiles(nextPuzzle)
    setTiles(nextPuzzle)
    setStarted(true)
    setShowWinScreen(false)
    setRewardGranted(false)
  }

  const handleHint = () => {
    if (!started) {
      return
    }

    setSelectedIndex(null)
    setHintedTileId(findHintTileId(tiles))
  }

  const handleUndo = () => {
    if (!started) {
      return
    }

    const previous = history[history.length - 1]
    if (!previous) {
      return
    }

    setTiles(previous)
    setHistory((currentHistory) => currentHistory.slice(0, -1))
    setSelectedIndex(null)
    setHintedTileId(null)
    setShowWinScreen(false)
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.backgroundGlowLarge} />
      <View style={styles.backgroundGlowSmall} />

      <View style={styles.container}>
        <View style={styles.topBar}>
          <IconAction
            icon="home-outline"
            onPress={() => navigation.navigate("LevelSelect")}
          />
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Chromatic Calm</Text>
            <DiamondBadge amount={diamonds} />
          </View>
          <IconAction icon="refresh" onPress={handleReset} />
        </View>

        <View style={styles.hero}>
          <LevelCard level={level.id} subtitle={level.name} />
          <Text style={styles.helperText}>
            {level.subtitle} Fixed anchors stay in place. Tap two free tiles to restore the gradient.
          </Text>
        </View>

        <View style={styles.boardSection}>
          <PuzzleBoard
            hintedTileId={hintedTileId}
            onTilePress={handleTilePress}
            selectedTileId={selectedIndex === null ? null : tiles[selectedIndex].id}
            size={level.size}
            tiles={tiles}
          />

          <View style={styles.startButtonSlot}>
            {!started ? (
              <Pressable
                onPress={handleStart}
                style={({ pressed }) => [
                  styles.startButton,
                  pressed && styles.startButtonPressed,
                ]}
              >
                <Text style={styles.startButtonLabel}>Start Level</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {started ? `${progress}% aligned` : "Preview ready"}
            </Text>
            <Text style={styles.metaText}>
              {!started
                ? "Tap start to shuffle"
                : isSolved(tiles)
                  ? "Gradient restored"
                  : "Soft shuffle"}
            </Text>
          </View>
        </View>

        <View style={styles.bottomArea}>
          <View style={styles.controls}>
            <ControlButton icon="shuffle-outline" label="Shuffle" onPress={handleShuffle} />
            <ControlButton icon="sparkles-outline" label="Hint" onPress={handleHint} />
            <ControlButton icon="arrow-undo-outline" label="Undo" onPress={handleUndo} />
          </View>
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
    backgroundColor: palette.background,
    flex: 1,
  },
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backgroundGlowLarge: {
    backgroundColor: "rgba(255,255,255,0.26)",
    borderRadius: 180,
    height: 260,
    position: "absolute",
    right: -40,
    top: 80,
    width: 260,
  },
  backgroundGlowSmall: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 120,
    bottom: 120,
    height: 180,
    left: -20,
    position: "absolute",
    width: 180,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    width: "100%",
  },
  headerCenter: {
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.34)",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  iconPressed: {
    opacity: 0.7,
  },
  headerTitle: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 2.2,
    textTransform: "uppercase",
  },
  diamondBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  diamondText: {
    color: palette.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  hero: {
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  helperText: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 240,
    textAlign: "center",
  },
  boardSection: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    width: "100%",
  },
  startButtonSlot: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 74,
    width: "100%",
  },
  startButton: {
    backgroundColor: "rgba(94,86,79,0.92)",
    borderRadius: 999,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  startButtonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.985 }],
  },
  startButtonLabel: {
    color: "#F7F3EC",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    paddingHorizontal: 8,
    width: "100%",
  },
  metaText: {
    color: palette.textMuted,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  bottomArea: {
    paddingTop: 16,
    width: "100%",
  },
  winOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(71, 65, 58, 0.28)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  winCard: {
    alignItems: "center",
    backgroundColor: "rgba(247,243,236,0.96)",
    borderRadius: 30,
    paddingHorizontal: 28,
    paddingVertical: 30,
    width: "100%",
  },
  winEyebrow: {
    color: palette.textMuted,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  winTitle: {
    color: palette.textPrimary,
    fontSize: 28,
    fontWeight: "400",
    marginTop: 10,
  },
  winText: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
    textAlign: "center",
  },
  winPrimaryButton: {
    backgroundColor: "rgba(94,86,79,0.94)",
    borderRadius: 999,
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 14,
    width: "100%",
  },
  winPrimaryLabel: {
    color: "#F7F3EC",
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
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  winButtonPressed: {
    opacity: 0.82,
  },
  controls: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.24)",
    borderRadius: 28,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 18,
    width: "100%",
  },
})
