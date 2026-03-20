import React from "react"
import { View, Text, StyleSheet, SafeAreaView } from "react-native"
import Header from "../components/Header"

export default function GameScreen({ route }) {
  const { level, mode } = route.params

  return (
    <SafeAreaView style={styles.container}>
      {/* Game screen header – only settings button visible */}
      <Header showLives={false} showCurrency={false} />

      <View style={styles.content}>
        <Text style={styles.title}>
          Mode: {mode} | Level: {level}
        </Text>

        <View style={styles.board}>
          <Text>Gameplay board will go here</Text>
        </View>
      </View>
    </SafeAreaView>
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
  },

  title: {
    fontSize: 20,
    marginBottom: 20
  },

  board: {
    width: "90%",
    height: "60%",
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  }
})