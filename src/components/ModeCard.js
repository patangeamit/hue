import React from "react"
import { TouchableOpacity, Text, StyleSheet, View } from "react-native"

export default function ModeCard({ title, subtitle, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    width: "90%",
    height: 110,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    padding: 20,
    marginBottom: 20,
    elevation: 3
  },

  title: {
    fontSize: 20,
    fontWeight: "600"
  },

  subtitle: {
    marginTop: 4,
    color: "#777"
  }
})