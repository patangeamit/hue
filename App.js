import "react-native-gesture-handler"
import React from "react"
import { NavigationContainer, DefaultTheme } from "@react-navigation/native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import AppNavigator from "./src/navigation/AppNavigator"

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#D8D2C0",
    card: "#D8D2C0",
    border: "transparent",
    text: "#605A52",
    primary: "#7F8DB4",
  },
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
