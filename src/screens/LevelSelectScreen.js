import React from "react"
import {
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"
import PuzzlePreviewGrid from "../components/PuzzlePreviewGrid"
import TopSheetMenu from "../components/TopSheetMenu"
import { levels } from "../data/levels"
import { useCurrency } from "../state/CurrencyContext"
import { palette } from "../theme/colors"

const PAGINATION_SLOT_COUNT = 5

function formatRechargeTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

function getIndicatorSlot(index, totalCount) {
  if (totalCount <= PAGINATION_SLOT_COUNT) {
    return index
  }

  if (index <= 0) {
    return 0
  }

  if (index === 1) {
    return 1
  }

  if (index >= totalCount - 1) {
    return 4
  }

  if (index === totalCount - 2) {
    return 3
  }

  return 2
}

const PuzzlePreview = React.memo(function PuzzlePreview({ level, width }) {
  const previewWidth = Math.min(width - 126, 250)

  return (
    <View style={styles.previewFrame}>
      <PuzzlePreviewGrid
        dimension={previewWidth}
        fixedTileCount={level.fixedTileCount}
        gradient={level.gradient}
        gap={0}
        rectangular
        size={level.size}
        tileRadius={0}
      />
    </View>
  )
})

const LevelSlide = React.memo(function LevelSlide({
  isCleared,
  isLocked,
  level,
  navigation,
  width,
}) {
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
            {isCleared ? (
              <View style={styles.metaPill}>
                <Text style={styles.metaPillText}>Cleared</Text>
              </View>
            ) : null}
          </View>

          <Pressable
            disabled={isLocked}
            onPress={() => navigation.push("Game", { levelId: level.id })}
            style={({ pressed }) => [
              isLocked ? styles.lockedButton : styles.playButton,
              pressed && styles.playButtonPressed,
            ]}
          >
            <Text style={isLocked ? styles.lockedButtonText : styles.playButtonText}>
              {isLocked ? "Locked" : "Play"}
            </Text>
            <Ionicons
              color={isLocked ? palette.textPrimary : "#F4EEDB"}
              name={isLocked ? "lock-closed" : "arrow-forward"}
              size={18}
            />
          </Pressable>
        </View>
      </View>
    </View>
  )
})

export default function LevelSelectScreen({ navigation }) {
  const {
    diamonds,
    energy,
    highestUnlockedLevelId,
    isLevelCleared,
    isLevelUnlocked,
    isMusicEnabled,
    maxEnergy,
    rechargeSecondsRemaining,
    toggleMusic,
  } = useCurrency()
  const { width } = useWindowDimensions()
  const listRef = React.useRef(null)
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true)
  const [showScores, setShowScores] = React.useState(true)
  const highestUnlockedLevelIndex = React.useMemo(
    () =>
      Math.max(
        0,
        levels.findIndex((level) => level.id === highestUnlockedLevelId)
      ),
    [highestUnlockedLevelId]
  )
  const [currentLevelIndex, setCurrentLevelIndex] = React.useState(
    highestUnlockedLevelIndex
  )
  const paginationSlot = React.useRef(
    new Animated.Value(getIndicatorSlot(highestUnlockedLevelIndex, levels.length))
  ).current
  const paginationPulse = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    setCurrentLevelIndex(highestUnlockedLevelIndex)
  }, [highestUnlockedLevelIndex])

  React.useEffect(() => {
    const nextSlot = getIndicatorSlot(currentLevelIndex, levels.length)

    Animated.parallel([
      Animated.spring(paginationSlot, {
        damping: 18,
        mass: 0.9,
        stiffness: 180,
        toValue: nextSlot,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(paginationPulse, {
          duration: 120,
          toValue: 1,
          useNativeDriver: false,
        }),
        Animated.timing(paginationPulse, {
          duration: 180,
          toValue: 0,
          useNativeDriver: false,
        }),
      ]),
    ]).start()
  }, [currentLevelIndex, paginationPulse, paginationSlot])

  const handleRandomLevel = React.useCallback(() => {
    const unlockedLevels = levels.filter((level) => isLevelUnlocked(level.id))
    const randomLevel =
      unlockedLevels[Math.floor(Math.random() * unlockedLevels.length)] ??
      levels[0]
    navigation.push("Game", { levelId: randomLevel.id })
  }, [isLevelUnlocked, navigation])

  const handleBackHome = React.useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
      return
    }

    navigation.navigate("Home")
  }, [navigation])

  const menuSettings = [
    {
      label: "Sound",
      onPress: toggleMusic,
      value: isMusicEnabled,
    },
  ]

  const menuPrimaryActions = [
    {
      label: "Random Level",
      onPress: handleRandomLevel,
    },
  ]

  const menuLinks = [
    {
      label: "Home",
      onPress: handleBackHome,
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
    { icon: "logo-google-playstore", onPress: () => {} },
    {icon: "share-social-sharp", onPress: () => {} },
  ]

  const renderLevelSlide = React.useCallback(
    ({ item }) => (
      <LevelSlide
        isCleared={isLevelCleared(item.id)}
        isLocked={!isLevelUnlocked(item.id)}
        level={item}
        navigation={navigation}
        width={width}
      />
    ),
    [isLevelCleared, isLevelUnlocked, navigation, width]
  )

  const getItemLayout = React.useCallback(
    (_, index) => ({
      index,
      length: width,
      offset: width * index,
    }),
    [width]
  )

  const handleMomentumScrollEnd = React.useCallback(
    (event) => {
      const offsetX = event.nativeEvent.contentOffset.x
      const nextIndex = Math.round(offsetX / width)

      setCurrentLevelIndex(Math.max(0, Math.min(levels.length - 1, nextIndex)))
    },
    [width]
  )

  useFocusEffect(
    React.useCallback(() => {
      const timeoutId = setTimeout(() => {
        listRef.current?.scrollToIndex({
          animated: false,
          index: highestUnlockedLevelIndex,
        })
      }, 0)

      return () => clearTimeout(timeoutId)
    }, [highestUnlockedLevelIndex])
  )

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.backgroundGlowLarge} />
      <View style={styles.backgroundGlowSmall} />

      <View style={styles.container}>
        <View style={styles.menuHeaderWrap}>
          <TopSheetMenu
            links={menuLinks}
            // onPlusPress={handleRandomLevel}
            primaryActions={menuPrimaryActions}
            // secondaryAction={{ label: "Close" }}
            settings={menuSettings}
            socialActions={menuSocialActions}
            stats={[
              {
                color: "#E59A9E",
                icon: "flash-outline",
                value: `${energy}/${maxEnergy}`,
              },
              { color: "#64A8D8", icon: "diamond-outline", value: diamonds },
            ]}
            title="Menu"
            triggerMode="header"
          />
        </View>
        <View style={styles.headerBlock}>
          <View style={styles.titleWrap}>
            <Text style={styles.headerTitle}>Levels</Text>
            <Text style={styles.headerSubtitle}>
              {energy > 0
                ? `Choose a palette. Energy ${energy}/${maxEnergy}.`
                : `Energy recharges in ${formatRechargeTime(rechargeSecondsRemaining)}.`}
            </Text>
          </View>
        </View>

        <FlatList
          data={levels}
          decelerationRate="fast"
          getItemLayout={getItemLayout}
          horizontal
          initialScrollIndex={highestUnlockedLevelIndex}
          initialNumToRender={1}
          keyExtractor={(level) => level.id}
          maxToRenderPerBatch={2}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          pagingEnabled
          ref={listRef}
          removeClippedSubviews
          renderItem={renderLevelSlide}
          showsHorizontalScrollIndicator={false}
          snapToAlignment="start"
          snapToInterval={width}
          style={styles.carousel}
          windowSize={3}
        />

        <View pointerEvents="none" style={styles.paginationWrap}>
          {Array.from({ length: Math.min(PAGINATION_SLOT_COUNT, levels.length) }, (_, slotIndex) => {
            const width = paginationSlot.interpolate({
              inputRange: [slotIndex - 1, slotIndex, slotIndex + 1],
              outputRange: [6, 18, 6],
              extrapolate: "clamp",
            })
            const opacity = paginationSlot.interpolate({
              inputRange: [slotIndex - 1, slotIndex, slotIndex + 1],
              outputRange: [0.38, 0.9, 0.38],
              extrapolate: "clamp",
            })
            const pulseScale = paginationPulse.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.08],
            })
            const baseScale = slotIndex === 0 || slotIndex === PAGINATION_SLOT_COUNT - 1 ? 0.9 : 1

            return (
              <Animated.View
                key={`pagination-dot-${slotIndex}`}
                style={[
                  styles.paginationDot,
                  {
                    opacity,
                    transform: [{ scale: pulseScale }, { scale: baseScale }],
                    width,
                  },
                ]}
              />
            )
          })}
        </View>
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
  menuHeaderWrap: {
    paddingTop: 10,
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
  headerBlock: {
    paddingHorizontal: 24,
  },
  titleWrap: {
    marginTop: 18,
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
  paginationWrap: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 8,
    minHeight: 24,
  },
  paginationDot: {
    backgroundColor: "#2D2430",
    borderRadius: 999,
    height: 6,
    width: 6,
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
  lockedButton: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "rgba(94,86,79,0.12)",
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
  lockedButtonText: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
})
