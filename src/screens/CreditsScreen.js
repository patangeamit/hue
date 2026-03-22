import React from "react"
import { StyleSheet, Text, View } from "react-native"
import InfoScreenFrame from "../components/InfoScreenFrame"
import { palette } from "../theme/colors"

function CreditRow({ label, value }) {
  return (
    <View style={styles.creditRow}>
      <Text style={styles.creditLabel}>{label}</Text>
      <Text style={styles.creditValue}>{value}</Text>
    </View>
  )
}

export default function CreditsScreen({ navigation }) {
  return (
    <InfoScreenFrame
      description="A quiet thank-you to the design, code, and audio touches shaping the experience."
      eyebrow="Credits"
      navigation={navigation}
      title="Built with care"
    >
      <CreditRow label="Creative Direction" value="Hue Studio" />
      <CreditRow label="Puzzle Design" value="Gradient Lab" />
      <CreditRow label="Interface" value="Soft Motion Systems" />
      <CreditRow label="Audio" value="Ambient Session Mix" />
      <Text style={styles.note}>
        Update these labels with your final studio, soundtrack, and contributor names whenever you are ready.
      </Text>
    </InfoScreenFrame>
  )
}

const styles = StyleSheet.create({
  creditRow: {
    borderBottomColor: "rgba(94,86,79,0.12)",
    borderBottomWidth: 1,
    paddingVertical: 16,
  },
  creditLabel: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  creditValue: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: "500",
    marginTop: 8,
  },
  note: {
    color: palette.textMuted,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 21,
    marginTop: 18,
  },
})
