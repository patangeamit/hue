import React from "react"
import { StyleSheet, View } from "react-native"
import { createSolvedTiles } from "./PuzzleBoard"

export default function PuzzlePreviewGrid({
  corners,
  dimension,
  gap = 0,
  rectangular = true,
  size,
  tileRadius = 0,
}) {
  const tiles = React.useMemo(
    () => createSolvedTiles(size, corners),
    [corners, size]
  )

  const gridWidth = dimension
  const gridHeight = rectangular ? Math.round(dimension * 1.34) : dimension
  const tileWidth = Math.floor((gridWidth - gap * (size - 1)) / size)
  const tileHeight = Math.floor((gridHeight - gap * (size - 1)) / size)
  const resolvedGridWidth = tileWidth * size + gap * (size - 1)
  const resolvedGridHeight = tileHeight * size + gap * (size - 1)

  return (
    <View
      style={[
        styles.grid,
        { height: resolvedGridHeight, width: resolvedGridWidth },
      ]}
    >
      {tiles.map((tile, index) => {
        const column = index % size
        const row = Math.floor(index / size)
        const isLastColumn = column === size - 1
        const isLastRow = row === size - 1

        return (
          <View
            key={tile.id}
            style={[
              styles.tile,
              {
                backgroundColor: tile.color,
                borderRadius: tileRadius,
                height: tileHeight,
                marginBottom: isLastRow ? 0 : gap,
                marginRight: isLastColumn ? 0 : gap,
                width: tileWidth,
              },
            ]}
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  tile: {
    overflow: "hidden",
  },
})
