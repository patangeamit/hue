import React from "react"
import { View, Text, StyleSheet, FlatList } from "react-native"
import Header from "../components/Header"
import LevelCard from "../components/LevelCard"
import { Dimensions } from "react-native"
const SCREEN_WIDTH = Dimensions.get("window").width
export default function LevelSelectScreen({ navigation, route }) {
  const { mode } = route.params

  const levels = Array.from({ length: 20 }, (_, i) => i + 1)

  return (
    <View style={styles.container}>
      <Header title="Select Level" />
      <FlatList
  data={levels}
  horizontal
  pagingEnabled
  decelerationRate="fast"
  showsHorizontalScrollIndicator={false}
  keyExtractor={(item) => item.toString()}
  renderItem={({ item }) => (
    <View style={styles.page}>
      <LevelCard
        level={item}
        onPress={() =>
          navigation.navigate("Game", { level: item, mode })
        }
      />
    </View>
  )}
/>
    </View>
  )
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: "#D8D2C0"
},
  list: {
    paddingLeft: 20,
    paddingTop: 20
  },
page: {
  width: SCREEN_WIDTH,
  alignItems: "center",
  justifyContent: "center"
}
})