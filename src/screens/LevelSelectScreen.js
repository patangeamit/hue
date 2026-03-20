import React from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import LevelCard from "../components/LevelCard"
import { levels } from "../data/levels"
import { useCurrency } from "../state/CurrencyContext"
import { palette } from "../theme/colors"

function LevelPreview({ level, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.levelButton, pressed && styles.levelButtonPressed]}
    >
      <View style={styles.levelTopRow}>
        <LevelCard level={level.id} subtitle={level.name} />
        <Ionicons color={palette.textMuted} name="chevron-forward" size={18} />
      </View>
      <Text style={styles.levelSubtitle}>{level.subtitle}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{level.size} x {level.size}</Text>
        <Text style={styles.metaText}>{level.reward} diamonds</Text>
      </View>
    </Pressable>
  )
}

export default function LevelSelectScreen({ navigation }) {
  const { diamonds } = useCurrency()

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.backgroundGlowLarge} />
      <View style={styles.backgroundGlowSmall} />

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Color Study</Text>
          <Text style={styles.title}>Choose a level</Text>
          <View style={styles.diamondBadge}>
            <Ionicons color="#64A8D8" name="diamond-outline" size={16} />
            <Text style={styles.diamondText}>{diamonds}</Text>
          </View>
          <Text style={styles.description}>
            Quiet gradients, fixed anchors, and a little room to breathe.
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          {levels.map((level) => (
            <LevelPreview
              key={level.id}
              level={level}
              onPress={() => navigation.navigate("Game", { levelId: level.id })}
            />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: palette.background,
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backgroundGlowLarge: {
    backgroundColor: "rgba(255,255,255,0.26)",
    borderRadius: 180,
    height: 260,
    position: "absolute",
    right: -40,
    top: 80,
    width: 260,
  },
  backgroundGlowSmall: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 120,
    bottom: 120,
    height: 180,
    left: -20,
    position: "absolute",
    width: 180,
  },
  header: {
    alignItems: "center",
    paddingTop: 12,
  },
  eyebrow: {
    color: palette.textMuted,
    fontSize: 12,
    letterSpacing: 2.2,
    textTransform: "uppercase",
  },
  title: {
    color: palette.textPrimary,
    fontSize: 30,
    fontWeight: "400",
    marginTop: 10,
  },
  diamondBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  diamondText: {
    color: palette.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  description: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
    maxWidth: 260,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
    marginTop: 28,
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 24,
  },
  levelButton: {
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 28,
    padding: 18,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  levelButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  levelTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  levelSubtitle: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 12,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  metaText: {
    color: palette.textMuted,
    fontSize: 12,
    letterSpacing: 0.4,
  },
})
