import React from "react"
import { View, StyleSheet } from "react-native"

export default function LevelPreview() {
  const rows = 3
  const cols = 3

  const tiles = []

  for (let r = 0; r < rows; r++) {
    const row = []
    for (let c = 0; c < cols; c++) {
      row.push(
        <View
          key={c}
          style={[
            styles.tile,
            {
              backgroundColor: randomColor()
            }
          ]}
        />
      )
    }

    tiles.push(
      <View key={r} style={styles.row}>
        {row}
      </View>
    )
  }

  return <View style={styles.container}>{tiles}</View>
}

function randomColor() {
  const hue = Math.floor(Math.random() * 360)
  return `hsl(${hue},70%,70%)`
}

const styles = StyleSheet.create({
  container: {
    height: 120,
    borderRadius: 10,
    overflow: "hidden"
  },

  row: {
    flexDirection: "row",
    flex: 1
  },

  tile: {
    flex: 1
  }
})