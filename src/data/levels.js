export const levels = [
  {
    id: "01",
    name: "Morning Mist",
    subtitle: "A gentle blue-to-blush fade.",
    reward: 18,
    size: 6,
    swapCount: 20,
    corners: {
      topLeft: "#7FAED8",
      topRight: "#F0C98D",
      bottomLeft: "#B390E0",
      bottomRight: "#EE8DA9",
    },
  },
  {
    id: "02",
    name: "Peach Quiet",
    subtitle: "Soft amber and dusty rose.",
    reward: 10,
    size: 4,
    swapCount: 10,
    corners: {
      topLeft: "#86B2D8",
      topRight: "#F2BE7E",
      bottomLeft: "#C398DA",
      bottomRight: "#EB8D95",
    },
  },
  {
    id: "03",
    name: "Lavender Air",
    subtitle: "Powdery violet drifting into sand.",
    reward: 12,
    size: 4,
    swapCount: 12,
    corners: {
      topLeft: "#739FD2",
      topRight: "#E8C57E",
      bottomLeft: "#AD82DA",
      bottomRight: "#EAA88E",
    },
  },
  {
    id: "04",
    name: "Pastel Bloom",
    subtitle: "Petal tones with a calm horizon.",
    reward: 14,
    size: 4,
    swapCount: 14,
    corners: {
      topLeft: "#6E9FD7",
      topRight: "#EDC16F",
      bottomLeft: "#B78BE0",
      bottomRight: "#EC8FA7",
    },
  },
  {
    id: "05",
    name: "Cloud Nectar",
    subtitle: "A lighter, smoother weave.",
    reward: 16,
    size: 5,
    swapCount: 14,
    corners: {
      topLeft: "#7DABDA",
      topRight: "#F3C688",
      bottomLeft: "#BF95DE",
      bottomRight: "#EE98B1",
    },
  },
  {
    id: "06",
    name: "Sunlit Hush",
    subtitle: "Warm cream fading into lilac dusk.",
    reward: 20,
    size: 5,
    swapCount: 18,
    corners: {
      topLeft: "#88B1D8",
      topRight: "#F4C36E",
      bottomLeft: "#B58ED8",
      bottomRight: "#E98B9D",
    },
  },
]

export function getLevelById(levelId) {
  return levels.find((level) => level.id === levelId) ?? levels[0]
}
