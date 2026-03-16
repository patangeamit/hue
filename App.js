import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "./screens/HomeScreen";
import LevelSelectScreen from "./screens/LevelSelectScreen";
import GameScreen from "./screens/GameScreen";
import WinScreen from "./screens/WinScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown:false }}>
        <Stack.Screen name="Home" component={HomeScreen}/>
        <Stack.Screen name="Levels" component={LevelSelectScreen}/>
        <Stack.Screen name="Game" component={GameScreen}/>
        <Stack.Screen name="Win" component={WinScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}