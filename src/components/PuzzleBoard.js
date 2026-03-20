import React from "react"
import {
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native"
import { palette } from "../theme/colors"

const BOARD_PADDING = 16
const BOARD_GAP = 6

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

export function createSolvedTiles(size = 4) {
  const { topLeft, topRight, bottomLeft, bottomRight } = palette.corners
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
}) {
  const { width } = useWindowDimensions()
  const boardSize = Math.min(width - 48, 340)
  const contentSize = boardSize - BOARD_PADDING * 2
  const tileSize = (contentSize - BOARD_GAP * (size - 1)) / size
  const rows = Array.from({ length: size }, (_, rowIndex) =>
    tiles.slice(rowIndex * size, rowIndex * size + size)
  )

  return (
    <View style={[styles.boardShell, { width: boardSize, height: boardSize }]}>
      <View style={[styles.board, { width: contentSize, height: contentSize }]}>
        {rows.map((row, rowIndex) => (
          <View
            key={`row-${rowIndex}`}
            style={[styles.row, rowIndex < size - 1 && styles.rowSpacing]}
          >
            {row.map((tile, columnIndex) => {
              const index = rowIndex * size + columnIndex
              const isSelected = tile.id === selectedTileId
              const isHinted = tile.id === hintedTileId

              return (
                <Pressable
                  disabled={tile.isFixed}
                  key={tile.id}
                  onPress={() => onTilePress(index)}
                  style={({ pressed }) => [
                    styles.tile,
                    {
                      backgroundColor: tile.color,
                      height: tileSize,
                      width: tileSize,
                    },
                    columnIndex < size - 1 && styles.tileSpacing,
                    tile.isFixed && styles.tileFixed,
                    isSelected && styles.tileSelected,
                    isHinted && styles.tileHinted,
                    pressed && !tile.isFixed && styles.tilePressed,
                  ]}
                >
                  {tile.isFixed ? <View style={styles.fixedMarker} /> : null}
                </Pressable>
              )
            })}
          </View>
        ))}
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
  },
  row: {
    flexDirection: "row",
  },
  rowSpacing: {
    marginBottom: BOARD_GAP,
  },
  tile: {
    alignItems: "center",
    borderRadius: 14,
    justifyContent: "center",
    shadowColor: "#8A8A8A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  tileSpacing: {
    marginRight: BOARD_GAP,
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
