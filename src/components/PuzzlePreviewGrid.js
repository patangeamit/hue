import React from "react"
import { StyleSheet, View } from "react-native"
import { createSolvedTiles } from "./PuzzleBoard"

const PuzzlePreviewGrid = React.memo(function PuzzlePreviewGrid({
  dimension,
  fixedTileCount,
  gradient,
  gap = 0,
  rectangular = true,
  size,
  tileRadius = 0,
}) {
  const tiles = React.useMemo(
    () => createSolvedTiles(size, gradient, fixedTileCount),
    [fixedTileCount, gradient, size]
  )

  const gridWidth = dimension
  const gridHeight = rectangular ? Math.round(dimension * 1.34) : dimension
  const resolvedGridWidth = gridWidth
  const resolvedGridHeight = gridHeight
  const fixedMarkerSize = Math.max(
    2,
    Math.min(5, Math.round((Math.min(resolvedGridWidth, resolvedGridHeight) / size) * 0.14))
  )
  const fixedMarkerRadius = Math.max(1, Math.round(fixedMarkerSize / 2))

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
        const left = Math.round((column * resolvedGridWidth) / size)
        const top = Math.round((row * resolvedGridHeight) / size)
        const right = Math.round(((column + 1) * resolvedGridWidth) / size)
        const bottom = Math.round(((row + 1) * resolvedGridHeight) / size)
        const resolvedTileWidth = right - left
        const resolvedTileHeight = bottom - top

        return (
          <View
            key={tile.id}
            style={[
              styles.tileLayer,
              {
                height: resolvedTileHeight,
                left,
                top,
                width: resolvedTileWidth,
              },
            ]}
          >
            <View
              style={[
                styles.tile,
                {
                  backgroundColor: tile.color,
                  borderRadius: tileRadius,
                  height: resolvedTileHeight,
                  width: resolvedTileWidth,
                },
              ]}
            >
              {tile.isFixed ? (
                <View
                  style={[
                    styles.fixedMarker,
                    {
                      borderRadius: fixedMarkerRadius,
                      height: fixedMarkerSize,
                      width: fixedMarkerSize,
                    },
                  ]}
                />
              ) : null}
            </View>
          </View>
        )
      })}
    </View>
  )
})

export default PuzzlePreviewGrid

const styles = StyleSheet.create({
  grid: {
    alignSelf: "center",
    overflow: "hidden",
    position: "relative",
  },
  tileLayer: {
    position: "absolute",
  },
  tile: {
    alignItems: "center",
    justifyContent: "center",
  },
  fixedMarker: {
    backgroundColor: "rgba(255,255,255,0.82)",
  },
})
