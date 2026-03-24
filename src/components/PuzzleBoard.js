import React from "react"
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native"
import { palette } from "../theme/colors"

const BOARD_PADDING = 0
const BOARD_GAP = 0

function clampChannel(value) {
  return Math.round(Math.max(0, Math.min(255, value)))
}

function getDefaultFixedTileCount(size) {
  if (size <= 4) {
    return 6
  }

  if (size === 5) {
    return 9
  }

  if (size === 6) {
    return 12
  }

  if (size === 7) {
    return 15
  }

  if (size === 8) {
    return 20
  }

  if (size === 9) {
    return 19
  }

  return 20
}

function getFixedIndexSet(size, fixedTileCount) {
  const centerLow = Math.floor((size - 1) / 2)
  const centerHigh = Math.ceil((size - 1) / 2)
  const quarterIndex = Math.max(1, Math.round((size - 1) * 0.25))
  const threeQuarterIndex = Math.min(size - 2, size - 1 - quarterIndex)
  const fixedIndexes = new Set()

  if (fixedTileCount <= 0) {
    return fixedIndexes
  }

  const addFixedCoordinate = (row, column) => {
    if (row < 0 || row >= size || column < 0 || column >= size) {
      return
    }

    fixedIndexes.add(row * size + column)
  }

  const candidateCoordinates = [
    [0, 0],
    [0, size - 1],
    [size - 1, 0],
    [size - 1, size - 1],
    [centerLow, centerLow],
    [centerLow, centerHigh],
    [centerHigh, centerLow],
    [centerHigh, centerHigh],
    [0, centerLow],
    [0, centerHigh],
    [size - 1, centerLow],
    [size - 1, centerHigh],
    [centerLow, 0],
    [centerHigh, 0],
    [centerLow, size - 1],
    [centerHigh, size - 1],
    [1, 1],
    [1, size - 2],
    [size - 2, 1],
    [size - 2, size - 2],
    [quarterIndex, quarterIndex],
    [quarterIndex, threeQuarterIndex],
    [threeQuarterIndex, quarterIndex],
    [threeQuarterIndex, threeQuarterIndex],
    [1, centerLow],
    [1, centerHigh],
    [size - 2, centerLow],
    [size - 2, centerHigh],
    [centerLow, 1],
    [centerHigh, 1],
    [centerLow, size - 2],
    [centerHigh, size - 2],
  ]

  for (const [row, column] of candidateCoordinates) {
    addFixedCoordinate(row, column)

    if (fixedIndexes.size >= fixedTileCount) {
      break
    }
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
  const channelToHex = (value) => clampChannel(value).toString(16).padStart(2, "0")
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

function blendNumber(valueA, valueB, ratio) {
  return valueA + (valueB - valueA) * ratio
}

function smoothstep(value) {
  const clampedValue = Math.max(0, Math.min(1, value))

  return clampedValue * clampedValue * (3 - 2 * clampedValue)
}

function resolveGradientColor(gradient, rowRatio, columnRatio) {
  const resolvedRowRatio = blendNumber(
    rowRatio,
    smoothstep(rowRatio),
    gradient?.edgeBias ?? 0
  )
  const resolvedColumnRatio = blendNumber(
    columnRatio,
    smoothstep(columnRatio),
    gradient?.edgeBias ?? 0
  )

  if (gradient?.gradientPoints?.length === 9) {
    const controlGrid = [
      gradient.gradientPoints.slice(0, 3),
      gradient.gradientPoints.slice(3, 6),
      gradient.gradientPoints.slice(6, 9),
    ]
    const horizontalSegment = Math.min(1, Math.floor(resolvedColumnRatio * 2))
    const verticalSegment = Math.min(1, Math.floor(resolvedRowRatio * 2))
    const localColumnRatio = resolvedColumnRatio <= 0
      ? 0
      : (resolvedColumnRatio - horizontalSegment * 0.5) / 0.5
    const localRowRatio = resolvedRowRatio <= 0
      ? 0
      : (resolvedRowRatio - verticalSegment * 0.5) / 0.5

    const topBlend = blendColors(
      controlGrid[verticalSegment][horizontalSegment],
      controlGrid[verticalSegment][horizontalSegment + 1],
      Math.max(0, Math.min(1, localColumnRatio))
    )
    const bottomBlend = blendColors(
      controlGrid[verticalSegment + 1][horizontalSegment],
      controlGrid[verticalSegment + 1][horizontalSegment + 1],
      Math.max(0, Math.min(1, localColumnRatio))
    )

    return blendColors(
      topBlend,
      bottomBlend,
      Math.max(0, Math.min(1, localRowRatio))
    )
  }

  const { topLeft, topRight, bottomLeft, bottomRight } = gradient?.corners ?? gradient
  const leftBlend = blendColors(topLeft, bottomLeft, resolvedRowRatio)
  const rightBlend = blendColors(topRight, bottomRight, resolvedRowRatio)

  return blendColors(leftBlend, rightBlend, resolvedColumnRatio)
}

function saturateColor(hex, amount = 1.42) {
  const { r, g, b } = hexToRgb(hex)
  const average = (r + g + b) / 3

  return rgbToHex({
    r: Math.round(average + (r - average) * amount),
    g: Math.round(average + (g - average) * amount),
    b: Math.round(average + (b - average) * amount),
  })
}

function adjustColorContrast(hex, amount = 1) {
  const { r, g, b } = hexToRgb(hex)
  const midpoint = 127.5

  return rgbToHex({
    r: midpoint + (r - midpoint) * amount,
    g: midpoint + (g - midpoint) * amount,
    b: midpoint + (b - midpoint) * amount,
  })
}

function shiftBrightness(hex, amount = 0) {
  const { r, g, b } = hexToRgb(hex)

  return rgbToHex({
    r: r + amount,
    g: g + amount,
    b: b + amount,
  })
}

function enhanceTileColor(hex, { contrastBoost = 1, isFixed = false } = {}) {
  const saturated = saturateColor(hex, 1.52)
  const contrasted = adjustColorContrast(saturated, contrastBoost)

  return shiftBrightness(contrasted, 8)
}

export function createSolvedTiles(size = 4, gradient = palette.corners, fixedTileCount) {
  const resolvedFixedTileCount = fixedTileCount ?? getDefaultFixedTileCount(size)
  const maximumFixedTileCount = Math.max(0, Math.min(size * size - 2, resolvedFixedTileCount))
  const fixedIndexes = getFixedIndexSet(size, maximumFixedTileCount)
  const tiles = []

  for (let row = 0; row < size; row += 1) {
    const rowRatio = size === 1 ? 0 : row / (size - 1)

    for (let column = 0; column < size; column += 1) {
      const columnRatio = size === 1 ? 0 : column / (size - 1)
      const correctIndex = row * size + column
      const isFixed = fixedIndexes.has(correctIndex)
      const baseColor = resolveGradientColor(gradient, rowRatio, columnRatio)

      tiles.push({
        id: `${row}-${column}`,
        color: enhanceTileColor(baseColor, {
          contrastBoost: gradient?.contrastBoost ?? 1,
          isFixed,
        }),
        correctIndex,
        isFixed,
      })
    }
  }

  return tiles
}

export default function PuzzleBoard({
  size = 4,
  tiles,
  onTileSwap,
  onTileTap,
  selectedTileId,
  rectangular = true,
  isWon = false,
}) {
  const { width } = useWindowDimensions()
  const boardSize = width
  const boardWidth = boardSize
  const boardHeight = rectangular ? Math.round(boardSize * 1.34) : boardSize
  const contentWidth = boardWidth - BOARD_PADDING * 2
  const contentHeight = boardHeight - BOARD_PADDING * 2
  const tileWidth = (contentWidth - BOARD_GAP * (size - 1)) / size
  const tileHeight = (contentHeight - BOARD_GAP * (size - 1)) / size
  const animatedPositionsRef = React.useRef({})
  const hasMountedRef = React.useRef(false)
  const boardRef = React.useRef(null)
  const [animatingTileIds, setAnimatingTileIds] = React.useState([])
  const [draggingTileId, setDraggingTileId] = React.useState(null)
  const dragOffsetRef = React.useRef(new Animated.ValueXY({ x: 0, y: 0 }))
  const boardScaleRef = React.useRef(new Animated.Value(1))
  const [boardFrame, setBoardFrame] = React.useState({
    height: 0,
    pageX: 0,
    pageY: 0,
    width: 0,
  })

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
    if (draggingTileId) {
      return
    }

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
  }, [draggingTileId, getTileCoordinates, tiles])

  const measureBoard = React.useCallback(() => {
    if (!boardRef.current?.measureInWindow) {
      return
    }

    boardRef.current.measureInWindow((pageX, pageY, measuredWidth, measuredHeight) => {
      setBoardFrame({
        height: measuredHeight,
        pageX,
        pageY,
        width: measuredWidth,
      })
    })
  }, [])

  React.useEffect(() => {
    measureBoard()
  }, [measureBoard, width, size])

  React.useEffect(() => {
    if (isWon) {
      // Win animation: shrink to 0.8 scale then bounce back to 1.0
      Animated.sequence([
        Animated.spring(boardScaleRef.current, {
          toValue: 1.1,
          friction: 9,
          tension: 1,
          useNativeDriver: true,
        }), 
        Animated.spring(boardScaleRef.current, {
          toValue: 0.8,
          friction: 9,
          tension: 1,
          useNativeDriver: true,
        }), 
        Animated.spring(boardScaleRef.current, {
          toValue: 1.0,
          friction: 9,
          tension: 1,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [isWon])

  const getSwapIndexFromPoint = React.useCallback(
    (moveX, moveY) => {
      const localX = moveX - boardFrame.pageX
      const localY = moveY - boardFrame.pageY
      const column = Math.max(
        0,
        Math.min(size - 1, Math.floor(localX / tileWidth))
      )
      const row = Math.max(
        0,
        Math.min(size - 1, Math.floor(localY / tileHeight))
      )

      return row * size + column
    },
    [boardFrame.pageX, boardFrame.pageY, size, tileHeight, tileWidth]
  )

  const resetDrag = React.useCallback(() => {
    Animated.spring(dragOffsetRef.current, {
      bounciness: 0,
      speed: 22,
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
    }).start()
    setDraggingTileId(null)
  }, [])

  const finishDrag = React.useCallback(() => {
    dragOffsetRef.current.stopAnimation(() => {
      dragOffsetRef.current.setValue({ x: 0, y: 0 })
      setDraggingTileId(null)
    })
  }, [])

  const getPanHandlers = React.useCallback(
    (tile, index) =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          !tile.isFixed &&
          (Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4),
        onPanResponderGrant: () => {
          if (tile.isFixed) {
            return
          }

          dragOffsetRef.current.setValue({ x: 0, y: 0 })
          setDraggingTileId(tile.id)
        },
        onPanResponderMove: (_, gestureState) => {
          dragOffsetRef.current.setValue({
            x: gestureState.dx,
            y: gestureState.dy,
          })
        },
        onPanResponderRelease: (_, gestureState) => {
          const toIndex = getSwapIndexFromPoint(
            gestureState.moveX,
            gestureState.moveY
          )
          const destinationTile = tiles[toIndex]

          if (
            toIndex === -1 ||
            toIndex === index ||
            !destinationTile ||
            destinationTile.isFixed
          ) {
            resetDrag()
            return
          }

          finishDrag()
          onTileSwap(index, toIndex)
        },
        onPanResponderTerminate: resetDrag,
      }).panHandlers,
    [finishDrag, getSwapIndexFromPoint, onTileSwap, resetDrag, tiles]
  )

  return (
    <View style={[styles.boardShell, { width: boardWidth, height: boardHeight }]}>
      <Animated.View
        onLayout={measureBoard}
        ref={boardRef}
        style={[
          styles.board,
          { width: contentWidth, height: contentHeight },
          { transform: [{ scale: boardScaleRef.current }] },
        ]}
      >
        {tiles.map((tile, index) => {
          const isDragging = draggingTileId === tile.id
          const isAnimating = animatingTileIds.includes(tile.id) || isDragging
          const isSelected = selectedTileId === tile.id
          const position = animatedPositionsRef.current[tile.id]
          const tileTransform = [{ translateX: position.x }, { translateY: position.y }]

          if (isDragging) {
            tileTransform.push({ translateX: dragOffsetRef.current.x })
            tileTransform.push({ translateY: dragOffsetRef.current.y })
            tileTransform.push({ scale: 1.02 })
          }

          return (
            <Animated.View
              key={tile.id}
              style={[
                styles.tileLayer,
                {
                  height: tileHeight,
                  transform: tileTransform,
                  width: tileWidth,
                },
                isAnimating && styles.tileLayerActive,
              ]}
              {...(!tile.isFixed ? getPanHandlers(tile, index) : {})}
            >
              <Pressable
                disabled={tile.isFixed}
                onPress={() => onTileTap?.(index)}
                style={[
                  styles.tile,
                  {
                    backgroundColor: tile.color,
                    height: tileHeight,
                    width: tileWidth,
                  },
                  tile.isFixed && styles.tileFixed,
                  isDragging && styles.tileDragging,
                  isSelected && styles.tileSelected,
                ]}
              >
                {tile.isFixed ? <View style={styles.fixedMarker} /> : null}
              </Pressable>
            </Animated.View>
          )
        })}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  boardShell: {
    alignItems: "center",
    justifyContent: "center",
    padding: BOARD_PADDING,
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
  },
  tileFixed: {
    opacity: 1,
  },
  tileDragging: {
    shadowColor: "#7B7367",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.26,
    shadowRadius: 18,
    elevation: 18,
  },
  tileSelected: {
    borderColor: "rgba(244,238,219,0.8)",
    borderWidth: 2,
  },
  fixedMarker: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 4,
    height: 8,
    width: 8,
  },
})
