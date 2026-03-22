import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import InfoScreenFrame from "../components/InfoScreenFrame"
import { palette } from "../theme/colors"

export default function RateAppScreen({ navigation }) {
  return (
    <InfoScreenFrame
      description="When store linking is ready, this page can hand off to the App Store or Play Store review flow."
      eyebrow="Rate App"
      navigation={navigation}
      title="Leave a glowing review"
    >
      <View style={styles.starsRow}>
        {[0, 1, 2, 3, 4].map((star) => (
          <View key={star} style={styles.starShell}>
            <Ionicons color="#C28B3D" name="star" size={22} />
          </View>
        ))}
      </View>

      <Text style={styles.body}>
        If the gradients feel good and the pacing feels right, this is the moment to invite ratings and short reviews.
      </Text>

      <Pressable style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaPressed]}>
        <Text style={styles.ctaLabel}>Store Link Coming Soon</Text>
      </Pressable>
    </InfoScreenFrame>
  )
}

const styles = StyleSheet.create({
  starsRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  starShell: {
    alignItems: "center",
    backgroundColor: "rgba(194,139,61,0.12)",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  body: {
    color: palette.textMuted,
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 22,
    marginTop: 20,
    textAlign: "center",
  },
  ctaButton: {
    alignItems: "center",
    backgroundColor: "#2D2430",
    borderRadius: 999,
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  ctaPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  ctaLabel: {
    color: "#F4EEDB",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
})
