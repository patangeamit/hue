import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Color Flow</Text>

      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate("Levels")}
      >
        <Text style={styles.buttonText}>Play</Text>
      </Pressable>
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
  title:{
    fontSize:36,
    color:"#fff",
    marginBottom:40
  },
  button:{
    backgroundColor:"#ffffff20",
    paddingHorizontal:40,
    paddingVertical:16,
    borderRadius:12
  },
  buttonText:{
    color:"#fff",
    fontSize:18
  }
});