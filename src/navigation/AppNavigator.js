import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import HomeScreen from "../screens/HomeScreen"
import LevelSelectScreen from "../screens/LevelSelectScreen"
import GameScreen from "../screens/GameScreen"

const Stack = createNativeStackNavigator()

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="LevelSelect" component={LevelSelectScreen} />
      <Stack.Screen name="Game" component={GameScreen} />
    </Stack.Navigator>
  )
}