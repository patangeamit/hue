function clampChannel(value) {
  return Math.max(0, Math.min(255, value))
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

const paletteFamilies = [
  {
    bottomLeft: "#B390E0",
    bottomRight: "#EE8DA9",
    topLeft: "#7FAED8",
    topRight: "#F0C98D",
  },
  {
    bottomLeft: "#A685DC",
    bottomRight: "#E58D8A",
    topLeft: "#78A4D2",
    topRight: "#E8BD72",
  },
  {
    bottomLeft: "#C3A1E4",
    bottomRight: "#F0A4BF",
    topLeft: "#94B9DF",
    topRight: "#F5D091",
  },
  {
    bottomLeft: "#8F8ADE",
    bottomRight: "#E39CB0",
    topLeft: "#73A1D8",
    topRight: "#E8C86A",
  },
  {
    bottomLeft: "#95B8E6",
    bottomRight: "#E5B27F",
    topLeft: "#6E97CD",
    topRight: "#F0D2A8",
  },
  {
    bottomLeft: "#58C8B2",
    bottomRight: "#F49A77",
    topLeft: "#4DA4D9",
    topRight: "#F0E17A",
  },
  {
    bottomLeft: "#6FD18F",
    bottomRight: "#EE7A9C",
    topLeft: "#4A8ED4",
    topRight: "#F4B35D",
  },
  {
    bottomLeft: "#8B73E6",
    bottomRight: "#6ECFC8",
    topLeft: "#5B91F0",
    topRight: "#F3A1A1",
  },
  {
    bottomLeft: "#55C5D9",
    bottomRight: "#F18768",
    topLeft: "#6B7FE1",
    topRight: "#C8E36A",
  },
  {
    bottomLeft: "#7AD9A6",
    bottomRight: "#F4C15E",
    topLeft: "#4EAFE2",
    topRight: "#F38BA8",
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

export const levels = Array.from({ length: 50 }, (_, index) => {
  const family = paletteFamilies[index % paletteFamilies.length]
  const phase = Math.floor(index / 5)
  const intensity = index / 49
  const shift = (phase - 4) * 5 + (index % paletteFamilies.length) * 2
  const size = 4 + Math.floor(Math.pow(intensity, 1.75) * 6)
  const levelNumber = index + 1

  return {
    corners: {
      bottomLeft: shiftHex(family.bottomLeft, shift - 4),
      bottomRight: shiftHex(family.bottomRight, shift + 6),
      topLeft: shiftHex(family.topLeft, shift),
      topRight: shiftHex(family.topRight, shift + 2),
    },
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
