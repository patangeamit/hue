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

function saturateColor(hex, amount = 1.22) {
  const { r, g, b } = hexToRgb(hex)
  const average = (r + g + b) / 3

  return rgbToHex({
    r: Math.max(0, Math.min(255, Math.round(average + (r - average) * amount))),
    g: Math.max(0, Math.min(255, Math.round(average + (g - average) * amount))),
    b: Math.max(0, Math.min(255, Math.round(average + (b - average) * amount))),
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
      const correctIndex = row * size + column
      const isFixed = fixedIndexes.has(correctIndex)
      const baseColor = blendColors(leftBlend, rightBlend, columnRatio)

      tiles.push({
        id: `${row}-${column}`,
        color: isFixed ? baseColor : saturateColor(baseColor),
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
