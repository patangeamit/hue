import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions
} from "react-native";

import * as Haptics from "expo-haptics";

import {
  generateGradientGrid,
  hslToString,
  generatePalette
} from "../colorUtils";

import {
  flattenGrid,
  shuffleTiles,
  checkSolved,
  isCorner
} from "../gameLogic";

export default function GameScreen({ route, navigation }) {

  const { rows, cols } = route.params;

  const size = Dimensions.get("window").width / cols;
 
  const [target,setTarget] = useState([]);
  const [tiles,setTiles] = useState([]);
  const [selected,setSelected] = useState(null);
  useEffect(()=>{

    const palette = generatePalette(); 

  // const THEMES = [
  //   "sunset",
  //   "ocean",
  //   "forest",
  //   "lavender",
  //   "random"
  //   ];

  //   const palette = generatePalette(
  //   THEMES[level % THEMES.length]
  //   );

    const grid = generateGradientGrid(rows,cols,palette);

    const flat = flattenGrid(grid).map(c=>JSON.stringify(c));

    setTarget(flat);
    setTiles(shuffleTiles(flat,rows,cols));

  },[]);

  function swap(i){

    if(isCorner(i, rows, cols)) return;

    if(selected===null){
      setSelected(i);
      Haptics.selectionAsync();
      return;
    }
 
    if(isCorner(selected, rows, cols)){
      setSelected(null);
      return;
    }

    const copy=[...tiles];
    [copy[i],copy[selected]]=[copy[selected],copy[i]];

    setTiles(copy);
    setSelected(null);

    if(checkSolved(copy,target)){
      navigation.replace("Win",{rows,cols});
    }
  }

  return (
    <View style={styles.container}>

      <View style={styles.grid}>
        {tiles.map((t,i)=>{
          const locked = isCorner(i, rows, cols);
          const hsl = JSON.parse(t);

          return(
            <Pressable
              key={i}
              onPress={()=>swap(i)}
              style={{
                width:size,
                height:size,
                backgroundColor:hslToString(...hsl),
                borderWidth:selected===i?3:locked?2:0,
                borderColor:locked?"#fff":"#fff",
                opacity:locked?0.9:1
              }}
            />
          )
        })}
      </View>

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
  grid:{
    flexDirection:"row",
    flexWrap:"wrap"
  }
});