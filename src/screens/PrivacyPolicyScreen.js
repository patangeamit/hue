import React from "react"
import { StyleSheet, Text, View } from "react-native"
import InfoScreenFrame from "../components/InfoScreenFrame"
import { palette } from "../theme/colors"

function PolicyBlock({ title, text }) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      <Text style={styles.blockText}>{text}</Text>
    </View>
  )
}

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <InfoScreenFrame
      description="A simple in-app policy page until your final hosted privacy URL is ready."
      eyebrow="Privacy"
      navigation={navigation}
      title="Privacy Policy"
    >
      <PolicyBlock
        text="Hue currently keeps game state on-device. Add analytics, account, or cloud-sync language here if that changes."
        title="What We Collect"
      />
      <PolicyBlock
        text="Settings like music preference and local progress are used to personalize the experience inside the app."
        title="How It Is Used"
      />
      <PolicyBlock
        text="Replace this temporary text with your production privacy policy URL and legal copy before release."
        title="Before Release"
      />
    </InfoScreenFrame>
  )
}

const styles = StyleSheet.create({
  block: {
    marginBottom: 18,
  },
  blockTitle: {
    color: palette.textPrimary,
    fontSize: 17,
    fontWeight: "600",
  },
  blockText: {
    color: palette.textMuted,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 21,
    marginTop: 8,
  },
})
