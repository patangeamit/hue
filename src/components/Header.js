import React, { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import SettingsDropdown from "./SettingsDropdown"

export default function Header({
  showLives = true,
  showCurrency = true
}) {
  const [open, setOpen] = useState(false)

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showLives && <Text style={styles.lives}>❤️ 5</Text>}
      </View>

      <View style={styles.right}>
        {showCurrency && <Text style={styles.currency}>💎 120</Text>}

        <TouchableOpacity onPress={() => setOpen(!open)}>
          <Text style={styles.settings}>⚙</Text>
        </TouchableOpacity>
      </View>

      <SettingsDropdown visible={open} onClose={() => setOpen(false)} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 70,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#D8D2C0",
    borderBottomWidth: 1,
    borderColor: "#eee"
  },

  left: {
    flexDirection: "row",
    alignItems: "center"
  },

  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20
  },

  lives: {
    fontSize: 16
  },

  currency: {
    fontSize: 16
  },

  settings: {
    fontSize: 22
  }
})