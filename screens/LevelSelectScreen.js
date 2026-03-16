import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

const LEVELS = [
  { id:1, rows:4, cols:4 },
  { id:2, rows:5, cols:5 },
  { id:3, rows:6, cols:6 }
];

export default function LevelSelectScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {LEVELS.map(level => (
        <Pressable
          key={level.id}
          style={styles.card}
          onPress={() =>
            navigation.navigate("Game", level)
          }
        >
          <Text style={styles.text}>
            Level {level.id}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:"#0f0f14",
    justifyContent:"center",
    alignItems:"center"
  },
  card:{
    backgroundColor:"#ffffff15",
    padding:24,
    borderRadius:12,
    marginVertical:10
  },
  text:{ color:"#fff", fontSize:18 }
});