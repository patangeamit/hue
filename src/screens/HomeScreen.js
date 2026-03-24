import React from "react"
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import PuzzlePreviewGrid from "../components/PuzzlePreviewGrid"
import TopSheetMenu from "../components/TopSheetMenu"
import { levels } from "../data/levels"
import { useCurrency } from "../state/CurrencyContext"
import { palette } from "../theme/colors"

function formatRechargeTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

function TileGraphic() {
  const { width } = useWindowDimensions()
  // const previewWidth = Math.min(width);

  return (
    <View style={styles.previewShell}>
      <PuzzlePreviewGrid
        dimension={width}
        gradient={levels[0].gradient}
        gap={0}
        rectangular
        size={5}
        tileRadius={0}
      />
    </View>
  )
}

export default function HomeScreen({ navigation }) {
  const {
    diamonds,
    energy,
    isMusicEnabled,
    maxEnergy,
    rechargeSecondsRemaining,
    resetGame,
    toggleMusic,
  } = useCurrency()
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true)
  const [showScores, setShowScores] = React.useState(true)

  const menuSettings = [
    {
      label: "Sound",
      onPress: toggleMusic,
      value: isMusicEnabled,
    },
    // {
    //   label: "Notifications",
    //   onPress: () => setNotificationsEnabled((currentValue) => !currentValue),
    //   value: notificationsEnabled,
    // },
    // {
    //   label: "Show Scores",
    //   onPress: () => setShowScores((currentValue) => !currentValue),
    //   value: showScores,
    // },
  ]

  const menuPrimaryActions = [
    // {
    //   label: "Remove Ads",
    //   onPress: () => navigation.navigate("RateApp"),
    // },
    // {
    //   label: "Achievements",
    //   onPress: () => navigation.navigate("Credits"),
    // },
  ]

  const menuLinks = [
    {
      label: "Level Select",
      onPress: () => navigation.push("LevelSelect"),
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
      label: "Reset Progress",
      onPress: resetGame,
    },
  ]

  const menuSocialActions = [
    // { icon: "logo-facebook", onPress: () => {} },
    // { icon: "logo-twitter", onPress: () => {} },
    { icon: "logo-google-playstore", onPress: () => {} },
    {icon: "share-social-sharp", onPress: () => {} },
  ]

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.backgroundGlowLarge} />
      <View style={styles.backgroundGlowSmall} />

      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>Hue</Text>
            {/* <Text style={styles.heroSubtitle}>A color puzzle adventure</Text> */}
          </View>

          <TopSheetMenu
            links={menuLinks}
            onPlusPress={() => navigation.push("LevelSelect")}
            primaryActions={menuPrimaryActions}
            // secondaryAction={{ label: "Close" }}
            settings={menuSettings}
            socialActions={menuSocialActions}
            stats={[
              { color: "#E59A9E", icon: "flash-outline", value: `${energy}/${maxEnergy}` },
              { color: "#64A8D8", icon: "diamond-outline", value: diamonds },
            ]}
            title="Menu"
          />
        </View>
        
        <TileGraphic />

        <Pressable
          onPress={() => navigation.push("LevelSelect")}
          style={({ pressed }) => [
            styles.playButton,
            pressed && styles.playButtonPressed,
          ]}
        >
          <Text style={styles.playButtonLabel}>Play</Text>
          <Ionicons color="#F4EEDB" name="arrow-forward" size={22} />
        </Pressable>
        {energy < maxEnergy ? (
          <Text style={styles.energyHint}>
            Next energy in {formatRechargeTime(rechargeSecondsRemaining)}
          </Text>
        ) : null}
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
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 28,
  },
  backgroundGlowLarge: {
    backgroundColor: "rgba(255,255,255,0.24)",
    borderRadius: 180,
    height: 280,
    position: "absolute",
    right: -50,
    top: 110,
    width: 280,
  },
  backgroundGlowSmall: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 140,
    bottom: 130,
    height: 210,
    left: -42,
    position: "absolute",
    width: 210,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titleWrap: {
    paddingLeft: 2,
  },
  title: {
    color: palette.textPrimary,
    fontSize: 40,
    fontWeight: "500",
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: palette.textPrimary,
    fontSize: 34,
    fontWeight: "500",
    letterSpacing: 0.6,
  },
  heroSubtitle: {
    color: palette.textMuted,
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.4,
    marginTop: 8,
  },
  previewShell: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    marginHorizontal: -24,
    overflow: "hidden",
  },
  previewHaloLarge: {
    backgroundColor: "rgba(255,255,255,0.34)",
    borderRadius: 90,
    height: 120,
    position: "absolute",
    right: 4,
    top: 10,
    width: 120,
  },
  previewHaloSmall: {
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 70,
    bottom: 18,
    height: 92,
    left: 8,
    position: "absolute",
    width: 92,
  },
  playButton: {
    alignItems: "center",
    backgroundColor: "#2D2430",
    borderRadius: 999,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 28,
    paddingVertical: 18,
    shadowColor: "#1C151B",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 6,
  },
  playButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  energyHint: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "500",
    marginTop: -12,
    textAlign: "center",
  },
  playButtonLabel: {
    color: "#F4EEDB",
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 0.8,
  },
})
