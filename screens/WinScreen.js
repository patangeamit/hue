import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function WinScreen({ navigation }) {

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Puzzle Complete</Text>

      <Pressable
        style={styles.button}
        onPress={()=>navigation.navigate("Levels")}
      >
        <Text style={styles.text}>Next Level</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={()=>navigation.popToTop()}
      >
        <Text style={styles.text}>Home</Text>
      </Pressable>

    </View>
  );
}

const styles=StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:"#0f0f14",
    justifyContent:"center",
    alignItems:"center"
  },
  title:{
    fontSize:30,
    color:"#fff",
    marginBottom:30
  },
  button:{
    backgroundColor:"#ffffff20",
    padding:16,
    borderRadius:10,
    marginVertical:10
  },
  text:{ color:"#fff", fontSize:16 }
});