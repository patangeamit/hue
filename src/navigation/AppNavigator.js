import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import CreditsScreen from "../screens/CreditsScreen"
import GameScreen from "../screens/GameScreen"
import LevelSelectScreen from "../screens/LevelSelectScreen"
import HomeScreen from "../screens/HomeScreen"
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen"
import RateAppScreen from "../screens/RateAppScreen"

const Stack = createNativeStackNavigator()

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="LevelSelect" component={LevelSelectScreen} />
      <Stack.Screen name="Game" component={GameScreen} />
      <Stack.Screen name="Credits" component={CreditsScreen} />
      <Stack.Screen name="RateApp" component={RateAppScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  )
}
