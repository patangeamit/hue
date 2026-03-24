function clampChannel(value) {
  return Math.round(Math.max(0, Math.min(255, value)))
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "")

  return {
    b: parseInt(normalized.slice(4, 6), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    r: parseInt(normalized.slice(0, 2), 16),
  }
}

function rgbToHex({ r, g, b }) {
  const channelToHex = (value) => clampChannel(value).toString(16).padStart(2, "0")
  return `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`
}

function shiftHex(hex, shift) {
  const { r, g, b } = hexToRgb(hex)

  return rgbToHex({
    b: b + Math.round(shift * 0.7),
    g: g + Math.round(shift * 0.45),
    r: r + shift,
  })
}

function tintHex(hex, amount) {
  const { r, g, b } = hexToRgb(hex)

  return rgbToHex({
    b: b + amount,
    g: g + amount,
    r: r + amount,
  })
}

function blendHex(colorA, colorB, ratio) {
  const a = hexToRgb(colorA)
  const b = hexToRgb(colorB)

  return rgbToHex({
    b: Math.round(a.b + (b.b - a.b) * ratio),
    g: Math.round(a.g + (b.g - a.g) * ratio),
    r: Math.round(a.r + (b.r - a.r) * ratio),
  })
}

function blendNumber(valueA, valueB, ratio) {
  return valueA + (valueB - valueA) * ratio
}

function smoothstep(value) {
  const clampedValue = Math.max(0, Math.min(1, value))

  return clampedValue * clampedValue * (3 - 2 * clampedValue)
}

function createNinePointGradient(corners, intensity) {
  const topCenterBase = blendHex(corners.topLeft, corners.topRight, 0.5)
  const middleLeftBase = blendHex(corners.topLeft, corners.bottomLeft, 0.5)
  const middleRightBase = blendHex(corners.topRight, corners.bottomRight, 0.5)
  const bottomCenterBase = blendHex(corners.bottomLeft, corners.bottomRight, 0.5)
  const centerBase = blendHex(
    blendHex(topCenterBase, bottomCenterBase, 0.5),
    blendHex(middleLeftBase, middleRightBase, 0.5),
    0.5
  )
  const center = tintHex(centerBase, Math.round(blendNumber(6, 14, intensity)))
  const topCenter = blendHex(topCenterBase, center, 0.16)
  const middleLeft = blendHex(middleLeftBase, center, 0.14)
  const middleRight = blendHex(middleRightBase, center, 0.14)
  const bottomCenter = blendHex(bottomCenterBase, center, 0.16)

  return [
    corners.topLeft,
    topCenter,
    corners.topRight,
    middleLeft,
    center,
    middleRight,
    corners.bottomLeft,
    bottomCenter,
    corners.bottomRight,
  ]
}

function createLevelGradient(corners, intensity, size, usesNinePointGradient) {
  const edgeBias = blendNumber(0.08, 0.3, smoothstep(intensity))
  const contrastBoost = blendNumber(1.06, size >= 8 ? 1.32 : 1.22, smoothstep(intensity))

  return {
    contrastBoost,
    corners,
    edgeBias,
    gradientPoints: usesNinePointGradient
      ? createNinePointGradient(corners, intensity)
      : undefined,
  }
}

const paletteFamilies = [
  {
    bottomLeft: "#7D90E8",
    bottomRight: "#E98BB0",
    topLeft: "#6DB7E8",
    topRight: "#F4C987",
  },
  {
    bottomLeft: "#6AA6E8",
    bottomRight: "#F1A07A",
    topLeft: "#53C3D8",
    topRight: "#F2D06C",
  },
  {
    bottomLeft: "#7E8CE6",
    bottomRight: "#E8A0D3",
    topLeft: "#73B3E5",
    topRight: "#F3BA8D",
  },
  {
    bottomLeft: "#5FC8C7",
    bottomRight: "#F3AB6C",
    topLeft: "#4F9FE5",
    topRight: "#F1DB73",
  },
  {
    bottomLeft: "#6F9DE8",
    bottomRight: "#D791EB",
    topLeft: "#7EC2E8",
    topRight: "#F4A98A",
  },
  {
    bottomLeft: "#58C9A9",
    bottomRight: "#EE8B7B",
    topLeft: "#69B4E8",
    topRight: "#F1D971",
  },
  {
    bottomLeft: "#5ABCB7",
    bottomRight: "#E78FB8",
    topLeft: "#5E8FE4",
    topRight: "#F2B870",
  },
  {
    bottomLeft: "#66A2E6",
    bottomRight: "#F29A98",
    topLeft: "#6ED0D1",
    topRight: "#F3C981",
  },
  {
    bottomLeft: "#7C86E8",
    bottomRight: "#F2A078",
    topLeft: "#60B9E5",
    topRight: "#F0D88A",
  },
  {
    bottomLeft: "#7F9BE7",
    bottomRight: "#E89BC8",
    topLeft: "#75C8E2",
    topRight: "#F4B98B",
  },
]

const firstWords = [
  "Morning",
  "Velvet",
  "Solar",
  "Quiet",
  "Lunar",
  "Amber",
  "Petal",
  "Coastal",
  "Prism",
  "Drift",
]

const secondWords = [
  "Mist",
  "Bloom",
  "Air",
  "Glow",
  "Echo",
]

const subtitleFragments = [
  "A quiet fade for patient hands.",
  "Soft corners and a slower rhythm.",
  "Warm light flowing into cool edges.",
  "A calm study in gentle contrast.",
  "Pastel motion with a glassy finish.",
]

let largeLevelCounter = 0

const levelGroups = [
  { fixedTileCounts: [6, 6, 5, 4], size: 4 },
  { fixedTileCounts: [9, 8, 7, 6], size: 5 },
  { fixedTileCounts: [12, 11, 10, 9, 8], size: 6 },
  { fixedTileCounts: [15, 14, 13, 12, 11], size: 7 },
  { fixedTileCounts: [20, 18, 16, 15, 14], size: 8 },
  { fixedTileCounts: [22, 20, 19, 18, 17, 16], size: 9 },
  { fixedTileCounts: [24, 23, 21, 20, 19, 18], size: 10 },
]

const levelBlueprints = levelGroups.flatMap(({ size, fixedTileCounts }) =>
  fixedTileCounts.map((fixedTileCount) => ({ fixedTileCount, size }))
)

export const totalLevelCount = levelBlueprints.length

export const levels = levelBlueprints.map(({ fixedTileCount, size }, index) => {
  const family = paletteFamilies[index % paletteFamilies.length]
  const phase = Math.floor(index / 5)
  const intensity = totalLevelCount === 1 ? 0 : index / (totalLevelCount - 1)
  const shift = (phase - 3) * 3 + (index % paletteFamilies.length)
  const levelNumber = index + 1
  const corners = {
    bottomLeft: shiftHex(family.bottomLeft, shift - 4),
    bottomRight: shiftHex(family.bottomRight, shift + 6),
    topLeft: shiftHex(family.topLeft, shift),
    topRight: shiftHex(family.topRight, shift + 2),
  }
  if (size > 6) {
    largeLevelCounter += 1
  }

  const usesNinePointGradient = size > 6 && largeLevelCounter % 3 === 0
  const gradient = createLevelGradient(corners, intensity, size, usesNinePointGradient)

  return {
    corners,
    fixedTileCount,
    gradient,
    id: String(levelNumber).padStart(2, "0"),
    name: `${firstWords[Math.floor(index / secondWords.length)]} ${secondWords[index % secondWords.length]}`,
    reward: 10 + size * 2 + Math.floor(intensity * 18),
    size,
    subtitle: subtitleFragments[index % subtitleFragments.length],
    swapCount: 8 + size * 2 + Math.floor(Math.pow(intensity, 1.25) * 16),
  }
})

export function getLevelById(levelId) {
  return levels.find((level) => level.id === levelId) ?? levels[0]
}
