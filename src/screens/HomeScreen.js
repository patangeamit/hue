import React from "react"
import { View, StyleSheet } from "react-native"
import Header from "../components/Header"
import ModeCard from "../components/ModeCard"

export default function HomeScreen({ navigation }) {
  const modes = [
    { name: "Beginner", subtitle: "Learn gradients" },
    { name: "Amateur", subtitle: "A bit harder" },
    { name: "Pro", subtitle: "For color masters" }
  ]

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.content}>
        {modes.map((mode) => (
          <ModeCard
            key={mode.name}
            title={mode.name}
            subtitle={mode.subtitle}
            onPress={() =>
              navigation.navigate("LevelSelect", { mode: mode.name })
            }
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
})