import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { palette } from "../theme/colors"

export default function ControlButton({ icon, label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
      ]}
    >
      <View style={styles.iconWrap}>
        <Ionicons color={palette.textPrimary} name={icon} size={18} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    gap: 8,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  label: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
})
