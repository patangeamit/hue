import React, { useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity
} from "react-native"

export default function SettingsDropdown({ visible, onClose }) {
  const translateY = useRef(new Animated.Value(-200)).current

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : -200,
      useNativeDriver: true
    }).start()
  }, [visible])

  if (!visible) return null

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }] }
      ]}
    >
      <TouchableOpacity onPress={onClose}>
        <Text style={styles.item}>Sound On/Off</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onClose}>
        <Text style={styles.item}>Music On/Off</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onClose}>
        <Text style={styles.item}>Remove Ads</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onClose}>
        <Text style={styles.item}>Privacy Policy</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 70,
    right: 20,
    width: 200,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    elevation: 5
  },

  item: {
    fontSize: 16,
    paddingVertical: 10
  }
})