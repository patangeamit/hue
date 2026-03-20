import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import LevelSelectScreen from "../screens/LevelSelectScreen"
import HomeScreen from "../screens/HomeScreen"

const Stack = createNativeStackNavigator()

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="LevelSelect"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="LevelSelect" component={LevelSelectScreen} />
      <Stack.Screen name="Game" component={HomeScreen} />
    </Stack.Navigator>
  )
}
