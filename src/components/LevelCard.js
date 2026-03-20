import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { palette } from "../theme/colors"

export default function LevelCard({ level = "04", subtitle = "Pastel Bloom" }) {
  return (
    <View style={styles.card}>
      <Text style={styles.level}>Level {level}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  level: {
    color: palette.textMuted,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  subtitle: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: "500",
    marginTop: 2,
  },
})
