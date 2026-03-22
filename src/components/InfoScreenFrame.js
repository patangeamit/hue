import React from "react"
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { palette } from "../theme/colors"

export default function InfoScreenFrame({
  children,
  description,
  eyebrow,
  navigation,
  title,
}) {
  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.backgroundGlowLarge} />
      <View style={styles.backgroundGlowSmall} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <Ionicons color={palette.textPrimary} name="arrow-back" size={18} />
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        <View style={styles.card}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: palette.background,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
    paddingHorizontal: 24,
    paddingTop: 6,
  },
  backgroundGlowLarge: {
    backgroundColor: "rgba(255,255,255,0.24)",
    borderRadius: 180,
    height: 300,
    position: "absolute",
    right: -60,
    top: 80,
    width: 300,
  },
  backgroundGlowSmall: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 140,
    bottom: 110,
    height: 220,
    left: -40,
    position: "absolute",
    width: 220,
  },
  backButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.34)",
    borderRadius: 999,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  backLabel: {
    color: palette.textPrimary,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  header: {
    alignItems: "center",
    marginTop: 24,
  },
  eyebrow: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2.2,
    textTransform: "uppercase",
  },
  title: {
    color: palette.textPrimary,
    fontSize: 34,
    fontWeight: "500",
    marginTop: 10,
    textAlign: "center",
  },
  description: {
    color: palette.textMuted,
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 22,
    marginTop: 12,
    maxWidth: 280,
    textAlign: "center",
  },
  card: {
    backgroundColor: "rgba(237,231,216,0.94)",
    borderRadius: 34,
    marginTop: 28,
    padding: 22,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 5,
  },
})
