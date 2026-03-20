import React, { useMemo, useState } from "react"
import {
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
import { palette } from "../theme/colors"

const GRID_SIZE = 4

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

export default function HomeScreen({ navigation }) {
  const solvedTiles = useMemo(() => createSolvedTiles(GRID_SIZE), [])
  const [initialTiles, setInitialTiles] = useState(() => createPuzzleTiles(solvedTiles))
  const [tiles, setTiles] = useState(initialTiles)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [hintedTileId, setHintedTileId] = useState(null)
  const [history, setHistory] = useState([])

  const progress = useMemo(() => {
    const orderedCount = tiles.filter(
      (tile, index) => tile.correctIndex === index
    ).length

    return Math.round((orderedCount / tiles.length) * 100)
  }, [tiles])

  const handleTilePress = (index) => {
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
    setTiles(initialTiles)
  }

  const handleShuffle = () => {
    const nextPuzzle = createPuzzleTiles(solvedTiles)
    setHistory([])
    setSelectedIndex(null)
    setHintedTileId(null)
    setInitialTiles(nextPuzzle)
    setTiles(nextPuzzle)
  }

  const handleHint = () => {
    setSelectedIndex(null)
    setHintedTileId(findHintTileId(tiles))
  }

  const handleUndo = () => {
    const previous = history[history.length - 1]
    if (!previous) {
      return
    }

    setTiles(previous)
    setHistory((currentHistory) => currentHistory.slice(0, -1))
    setSelectedIndex(null)
    setHintedTileId(null)
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.backgroundGlowLarge} />
      <View style={styles.backgroundGlowSmall} />

      <View style={styles.container}>
        <View style={styles.topBar}>
          <IconAction
            icon="home-outline"
            onPress={() => navigation.navigate("Home")}
          />
          <Text style={styles.headerTitle}>Chromatic Calm</Text>
          <IconAction icon="refresh" onPress={handleReset} />
        </View>

        <View style={styles.hero}>
          <LevelCard />
          <Text style={styles.helperText}>
            Fixed anchors stay in place. Tap two free tiles to restore the gradient.
          </Text>
        </View>

        <View style={styles.boardSection}>
          <PuzzleBoard
            hintedTileId={hintedTileId}
            onTilePress={handleTilePress}
            selectedTileId={selectedIndex === null ? null : tiles[selectedIndex].id}
            size={GRID_SIZE}
            tiles={tiles}
          />

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{progress}% aligned</Text>
            <Text style={styles.metaText}>
              {isSolved(tiles) ? "Gradient restored" : "Soft shuffle"}
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
