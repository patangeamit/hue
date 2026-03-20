import React from "react"
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native"
import { palette } from "../theme/colors"

const BOARD_PADDING = 14
const BOARD_GAP = 0

function getFixedIndexSet(size) {
  const lastIndex = size * size - 1
  const fixedIndexes = new Set([0, size - 1, size * (size - 1), lastIndex])

  if (size % 2 === 1) {
    fixedIndexes.add(Math.floor((size * size) / 2))
  } else {
    fixedIndexes.add(size + 1)
    fixedIndexes.add(size * (size - 2) - 2)
  }

  return fixedIndexes
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "")

  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  }
}

function rgbToHex({ r, g, b }) {
  const channelToHex = (value) => value.toString(16).padStart(2, "0")
  return `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`
}

function blendColors(colorA, colorB, ratio) {
  const a = hexToRgb(colorA)
  const b = hexToRgb(colorB)

  return rgbToHex({
    r: Math.round(a.r + (b.r - a.r) * ratio),
    g: Math.round(a.g + (b.g - a.g) * ratio),
    b: Math.round(a.b + (b.b - a.b) * ratio),
  })
}

export function createSolvedTiles(size = 4, corners = palette.corners) {
  const { topLeft, topRight, bottomLeft, bottomRight } = corners
  const fixedIndexes = getFixedIndexSet(size)
  const tiles = []

  for (let row = 0; row < size; row += 1) {
    const rowRatio = size === 1 ? 0 : row / (size - 1)
    const leftBlend = blendColors(topLeft, bottomLeft, rowRatio)
    const rightBlend = blendColors(topRight, bottomRight, rowRatio)

    for (let column = 0; column < size; column += 1) {
      const columnRatio = size === 1 ? 0 : column / (size - 1)

      tiles.push({
        id: `${row}-${column}`,
        color: blendColors(leftBlend, rightBlend, columnRatio),
        correctIndex: row * size + column,
        isFixed: fixedIndexes.has(row * size + column),
      })
    }
  }

  return tiles
}

export default function PuzzleBoard({
  size = 4,
  tiles,
  selectedTileId,
  hintedTileId,
  onTilePress,
  rectangular = true,
}) {
  const { width } = useWindowDimensions()
  const boardSize = Math.min(width - 24, 380)
  const boardWidth = boardSize
  const boardHeight = rectangular ? Math.round(boardSize * 1.18) : boardSize
  const contentWidth = boardWidth - BOARD_PADDING * 2
  const contentHeight = boardHeight - BOARD_PADDING * 2
  const tileWidth = (contentWidth - BOARD_GAP * (size - 1)) / size
  const tileHeight = (contentHeight - BOARD_GAP * (size - 1)) / size
  const animatedPositionsRef = React.useRef({})
  const hasMountedRef = React.useRef(false)
  const [animatingTileIds, setAnimatingTileIds] = React.useState([])

  const getTileCoordinates = React.useCallback(
    (index) => {
      const row = Math.floor(index / size)
      const column = index % size

      return {
        x: column * (tileWidth + BOARD_GAP),
        y: row * (tileHeight + BOARD_GAP),
      }
    },
    [size, tileHeight, tileWidth]
  )

  tiles.forEach((tile, index) => {
    if (!animatedPositionsRef.current[tile.id]) {
      const { x, y } = getTileCoordinates(index)
      animatedPositionsRef.current[tile.id] = {
        x: new Animated.Value(x),
        y: new Animated.Value(y),
      }
    }
  })

  React.useEffect(() => {
    const movingTileIds = []
    const animations = tiles.map((tile, index) => {
      const position = animatedPositionsRef.current[tile.id]
      const { x, y } = getTileCoordinates(index)

      if (!hasMountedRef.current) {
        position.x.setValue(x)
        position.y.setValue(y)
        return null
      }

      const currentX = position.x.__getValue()
      const currentY = position.y.__getValue()

      if (currentX === x && currentY === y) {
        return null
      }

      movingTileIds.push(tile.id)

      return Animated.parallel([
        Animated.timing(position.x, {
          duration: 260,
          easing: Easing.out(Easing.cubic),
          toValue: x,
          useNativeDriver: true,
        }),
        Animated.timing(position.y, {
          duration: 260,
          easing: Easing.out(Easing.cubic),
          toValue: y,
          useNativeDriver: true,
        }),
      ])
    }).filter(Boolean)

    if (animations.length > 0) {
      setAnimatingTileIds(movingTileIds)
      Animated.parallel(animations).start(() => {
        setAnimatingTileIds([])
      })
    }

    hasMountedRef.current = true
  }, [getTileCoordinates, tiles])

  return (
    <View style={[styles.boardShell, { width: boardWidth, height: boardHeight }]}>
      <View style={[styles.board, { width: contentWidth, height: contentHeight }]}>
        {tiles.map((tile, index) => {
          const isSelected = tile.id === selectedTileId
          const isHinted = tile.id === hintedTileId
          const isAnimating = animatingTileIds.includes(tile.id)
          const position = animatedPositionsRef.current[tile.id]

          return (
            <Animated.View
              key={tile.id}
              style={[
                styles.tileLayer,
                {
                  height: tileHeight,
                  transform: [
                    { translateX: position.x },
                    { translateY: position.y },
                  ],
                  width: tileWidth,
                },
                isAnimating && styles.tileLayerActive,
              ]}
            >
              <Pressable
                disabled={tile.isFixed}
                onPress={() => onTilePress(index)}
                style={({ pressed }) => [
                  styles.tile,
                  {
                    backgroundColor: tile.color,
                    height: tileHeight,
                    width: tileWidth,
                  },
                  tile.isFixed && styles.tileFixed,
                  isSelected && styles.tileSelected,
                  isHinted && styles.tileHinted,
                  pressed && !tile.isFixed && styles.tilePressed,
                ]}
              >
                {tile.isFixed ? <View style={styles.fixedMarker} /> : null}
              </Pressable>
            </Animated.View>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  boardShell: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.26)",
    borderRadius: 34,
    justifyContent: "center",
    padding: BOARD_PADDING,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 6,
  },
  board: {
    justifyContent: "center",
    position: "relative",
  },
  tileLayer: {
    left: 0,
    position: "absolute",
    top: 0,
    zIndex: 1,
  },
  tileLayerActive: {
    elevation: 12,
    zIndex: 30,
  },
  tile: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8A8A8A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  tileFixed: {
    shadowOpacity: 0.04,
    elevation: 0,
  },
  tileHinted: {
    borderColor: "rgba(255,255,255,0.9)",
    borderWidth: 2,
  },
  tilePressed: {
    transform: [{ scale: 0.96 }],
  },
  tileSelected: {
    borderColor: "rgba(94,86,79,0.42)",
    borderWidth: 2,
    transform: [{ scale: 0.97 }],
  },
  fixedMarker: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 4,
    height: 8,
    width: 8,
  },
})
