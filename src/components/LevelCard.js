import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import LevelPreview from "./LevelPreview"

export default function LevelCard({ level, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={styles.preview}>
            <LevelPreview />
        </View>

        <Text style={styles.level}>Level {level}</Text>
    </TouchableOpacity>
  )
}
const styles = StyleSheet.create({
  card: {
    width: "82%",
    height: "72%",
    borderRadius: 14,
    backgroundColor: "#F2EDE2",
    padding: 20,
    justifyContent: "space-between",
    alignItems: "center"
  },

  preview: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#E8E2D2"
  },

  level: {
    fontSize: 16,
    color: "#E57373",
    letterSpacing: 1,
    fontWeight: "500"
  }
})