import React from "react"
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import PuzzlePreviewGrid from "../components/PuzzlePreviewGrid"
import TopSheetMenu from "../components/TopSheetMenu"
import { levels } from "../data/levels"
import { useCurrency } from "../state/CurrencyContext"
import { palette } from "../theme/colors"

function PuzzlePreview({ level, width }) {
  const previewWidth = Math.min(width - 126, 250)

  return (
    <View style={styles.previewFrame}>
      <PuzzlePreviewGrid
        corners={level.corners}
        dimension={previewWidth}
        gap={0}
        rectangular
        size={level.size}
        tileRadius={0}
      />
    </View>
  )
}

function LevelSlide({ level, navigation, width }) {
  return (
    <View style={[styles.slide, { width }]}>
      <View style={styles.slideInner}>
        <View style={styles.card}>
          <View style={styles.cardGlowLarge} />
          <View style={styles.cardGlowSmall} />

          <Text style={styles.cardLabel}>Level {Number(level.id)}</Text>
          <Text style={styles.cardTitle}>{level.name}</Text>

          <View style={styles.previewWrap}>
            <PuzzlePreview level={level} width={width} />
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>{level.size} x {level.size}</Text>
            </View>
            <View style={styles.metaPill}>
              <Ionicons color="#64A8D8" name="diamond-outline" size={14} />
              <Text style={styles.metaPillText}>{level.reward}</Text>
            </View>
          </View>

          <Pressable
            onPress={() => navigation.navigate("Game", { levelId: level.id })}
            style={({ pressed }) => [
              styles.playButton,
              pressed && styles.playButtonPressed,
            ]}
          >
            <Text style={styles.playButtonText}>Play</Text>
            <Ionicons color="#F4EEDB" name="arrow-forward" size={18} />
          </Pressable>
        </View>
      </View>
    </View>
  )
}

export default function LevelSelectScreen({ navigation }) {
  const { diamonds, isMusicEnabled, toggleMusic } = useCurrency()
  const { width } = useWindowDimensions()
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true)
  const [showScores, setShowScores] = React.useState(true)

  const handleRandomLevel = React.useCallback(() => {
    const randomLevel = levels[Math.floor(Math.random() * levels.length)]
    console.log(levels)
    navigation.navigate("Game", { levelId: randomLevel.id })
  }, [navigation])

  const menuSettings = [
    {
      label: "Sound",
      onPress: toggleMusic,
      value: isMusicEnabled,
    },
    {
      label: "Notifications",
      onPress: () => setNotificationsEnabled((currentValue) => !currentValue),
      value: notificationsEnabled,
    },
    {
      label: "Show Scores",
      onPress: () => setShowScores((currentValue) => !currentValue),
      value: showScores,
    },
  ]

  const menuPrimaryActions = [
    {
      label: "Random Level",
      onPress: handleRandomLevel,
    },
    {
      label: "Back Home",
      onPress: () => navigation.navigate("Home"),
    },
  ]

  const menuLinks = [
    {
      label: "Home",
      onPress: () => navigation.navigate("Home"),
    },
    {
      label: "Credits",
      onPress: () => navigation.navigate("Credits"),
    },
    {
      label: "Privacy Policy",
      onPress: () => navigation.navigate("PrivacyPolicy"),
    },
    {
      label: "Rate App",
      onPress: () => navigation.navigate("RateApp"),
    },
  ]

  const menuSocialActions = [
    { icon: "logo-facebook", onPress: () => {} },
    { icon: "logo-twitter", onPress: () => {} },
    { icon: "logo-instagram", onPress: () => {} },
  ]

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.backgroundGlowLarge} />
      <View style={styles.backgroundGlowSmall} />

      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Levels</Text>
            <Text style={styles.headerSubtitle}>Choose a palette.</Text>
          </View>

          <TopSheetMenu
            links={menuLinks}
            onPlusPress={handleRandomLevel}
            primaryActions={menuPrimaryActions}
            secondaryAction={{ label: "Close" }}
            settings={menuSettings}
            socialActions={menuSocialActions}
            stats={[
              { color: "#E59A9E", icon: "heart-outline", value: 31 },
              { color: "#64A8D8", icon: "diamond-outline", value: diamonds },
            ]}
            title="Menu"
          />
        </View>

        <FlatList
          data={levels}
          decelerationRate="fast"
          horizontal
          keyExtractor={(level) => level.id}
          pagingEnabled
          renderItem={({ item }) => (
            <LevelSlide level={item} navigation={navigation} width={width} />
          )}
          showsHorizontalScrollIndicator={false}
          snapToAlignment="start"
          snapToInterval={width}
          style={styles.carousel}
        />
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
    paddingBottom: 20,
  },
  backgroundGlowLarge: {
    backgroundColor: "rgba(255,255,255,0.26)",
    borderRadius: 180,
    height: 260,
    position: "absolute",
    right: -40,
    top: 120,
    width: 260,
  },
  backgroundGlowSmall: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 120,
    bottom: 100,
    height: 180,
    left: -20,
    position: "absolute",
    width: 180,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  headerTitle: {
    color: palette.textPrimary,
    fontSize: 34,
    fontWeight: "500",
    letterSpacing: 0.6,
  },
  headerSubtitle: {
    color: palette.textMuted,
    fontSize: 14,
    fontWeight: "500",
    marginTop: 6,
  },
  carousel: {
    flex: 1,
    marginTop: 18,
  },
  slide: {
    flex: 1,
  },
  slideInner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 6,
  },
  card: {
    alignItems: "center",
    backgroundColor: "rgba(239,232,216,0.92)",
    borderRadius: 38,
    flex: 1,
    overflow: "hidden",
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 5,
  },
  cardGlowLarge: {
    backgroundColor: "rgba(255,255,255,0.24)",
    borderRadius: 120,
    height: 160,
    position: "absolute",
    right: -12,
    top: 80,
    width: 160,
  },
  cardGlowSmall: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 90,
    bottom: 40,
    height: 120,
    left: -20,
    position: "absolute",
    width: 120,
  },
  cardLabel: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2.1,
    textTransform: "uppercase",
  },
  cardTitle: {
    color: palette.textPrimary,
    fontSize: 30,
    fontWeight: "500",
    marginTop: 8,
  },
  previewWrap: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    width: "100%",
  },
  previewFrame: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 310,
    width: "100%",
  },
  metaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  metaPill: {
    alignItems: "center",
    backgroundColor: "rgba(94,86,79,0.08)",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  metaPillText: {
    color: palette.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  playButton: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "#2D2430",
    borderRadius: 999,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 18,
    paddingVertical: 16,
  },
  playButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  playButtonText: {
    color: "#F4EEDB",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
})
