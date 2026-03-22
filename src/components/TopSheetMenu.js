import React from "react"
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { palette } from "../theme/colors"

function StatChip({ color, icon, value }) {
  return (
    <View style={styles.statChip}>
      <Ionicons color={color || palette.textPrimary} name={icon} size={28} />
      <Text style={styles.statValue}>{value}</Text>
    </View>
  )
}

function MenuToggleRow({ label, onPress, value }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          value ? styles.toggleButtonActive : styles.toggleButtonInactive,
          pressed && styles.toggleButtonPressed,
        ]}
      >
        <Ionicons
          color={value ? palette.surface : palette.textPrimary}
          name={value ? "checkmark" : "close"}
          size={26}
        />
      </Pressable>
    </View>
  )
}

function MenuPrimaryButton({ label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        pressed && styles.primaryButtonPressed,
      ]}
    >
      <Text style={styles.primaryButtonLabel}>{label}</Text>
    </Pressable>
  )
}

function MenuTextLink({ label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.textLink, pressed && styles.textLinkPressed]}
    >
      <Text style={styles.textLinkLabel}>- {label} -</Text>
    </Pressable>
  )
}

function MenuSocialButton({ icon, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.socialButton,
        pressed && styles.socialButtonPressed,
      ]}
    >
      <Ionicons color={palette.surface} name={icon} size={28} />
    </Pressable>
  )
}

export default function TopSheetMenu({
  links = [],
  onPlusPress,
  primaryActions = [],
  secondaryAction,
  settings = [],
  socialActions = [],
  stats = [],
  title,
  triggerMode = "icon",
}) {
  const insets = useSafeAreaInsets()
  const [isOpen, setIsOpen] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)
  const translateY = React.useRef(new Animated.Value(-48)).current
  const opacity = React.useRef(new Animated.Value(0)).current

  const openMenu = React.useCallback(() => {
    setIsMounted(true)
    setIsOpen(true)
  }, [])

  const closeMenu = React.useCallback(() => {
    setIsOpen(false)
  }, [])

  const toggleMenu = React.useCallback(() => {
    if (isOpen) {
      closeMenu()
      return
    }

    openMenu()
  }, [closeMenu, isOpen, openMenu])

  React.useEffect(() => {
    if (!isMounted) {
      return
    }

    if (isOpen) {
      Animated.parallel([
        Animated.timing(translateY, {
          duration: 240,
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          duration: 220,
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start()
      return
    }

    Animated.parallel([
      Animated.timing(translateY, {
        duration: 180,
        toValue: -48,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        duration: 160,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setIsMounted(false)
      }
    })
  }, [isMounted, isOpen, opacity, translateY])

  const handleActionPress = React.useCallback(
    (onPress, shouldClose = true) => {
      if (shouldClose) {
        closeMenu()
      }
      onPress?.()
    },
    [closeMenu]
  )

  return (
    <>
      {triggerMode === "header" ? (
        <View style={styles.topRow}>
          <View style={styles.statsRow}>
            {stats.map((stat) => (
              <StatChip
                key={`trigger-${stat.icon}-${stat.value}`}
                color={stat.color}
                icon={stat.icon}
                value={stat.value}
              />
            ))}
          </View>

          <View style={styles.topActions}>
            {onPlusPress ? (
              <Pressable
                accessibilityLabel="Primary action"
                onPress={onPlusPress}
                style={({ pressed }) => [
                  styles.topCircleButton,
                  pressed && styles.circleButtonPressed,
                ]}
              >
                <Ionicons color={palette.textPrimary} name="add" size={24} />
              </Pressable>
            ) : null}

            <Pressable
              accessibilityLabel="Open menu"
              onPress={toggleMenu}
              style={({ pressed }) => [
                styles.topCircleButton,
                pressed && styles.circleButtonPressed,
              ]}
            >
              <Ionicons color={palette.textPrimary} name="options-outline" size={21} />
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          accessibilityLabel="Open menu"
          onPress={toggleMenu}
          style={({ pressed }) => [
            styles.triggerButton,
            pressed && styles.triggerButtonPressed,
          ]}
        >
          <Ionicons color={palette.textPrimary} name="options-outline" size={22} />
        </Pressable>
      )}

      <Modal
        animationType="none"
        onRequestClose={closeMenu}
        statusBarTranslucent
        transparent
        visible={isMounted}
      >
        <Animated.View style={[styles.modalRoot, { opacity }]}>
          <Pressable onPress={closeMenu} style={styles.backdropPressable} />
          <Animated.View
            style={[
              styles.sheet,
              {
                paddingTop: insets.top + 12,
                paddingBottom: Math.max(insets.bottom, 18),
                transform: [{ translateY }],
              },
            ]}
          >
            <View style={styles.topRow}>
              <View style={styles.statsRow}>
                {stats.map((stat) => (
                  <StatChip
                    key={`${stat.icon}-${stat.value}`}
                    color={stat.color}
                    icon={stat.icon}
                    value={stat.value}
                  />
                ))}
              </View>

              <View style={styles.topActions}>
                {onPlusPress ? (
                  <Pressable
                    accessibilityLabel="Primary action"
                    onPress={() => handleActionPress(onPlusPress)}
                    style={({ pressed }) => [
                      styles.topCircleButton,
                      pressed && styles.circleButtonPressed,
                    ]}
                  >
                    <Ionicons color={palette.textPrimary} name="add" size={24} />
                  </Pressable>
                ) : null}

                <Pressable
                  accessibilityLabel="Toggle menu"
                  onPress={toggleMenu}
                  style={({ pressed }) => [
                    styles.topCircleButton,
                    pressed && styles.circleButtonPressed,
                  ]}
                >
                  <Ionicons color={palette.textPrimary} name="options-outline" size={21} />
                </Pressable>
              </View>
            </View>

            <View style={styles.divider} />

            <ScrollView
              bounces={false}
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {title ? <Text style={styles.menuTitle}>{title}</Text> : null}

              <View style={styles.settingsList}>
                {settings.map((setting) => (
                  <MenuToggleRow
                    key={setting.label}
                    label={setting.label}
                    onPress={setting.onPress}
                    value={setting.value}
                  />
                ))}
              </View>

              <View style={styles.primaryActionsList}>
                {primaryActions.map((action) => (
                  <MenuPrimaryButton
                    key={action.label}
                    label={action.label}
                    onPress={() => handleActionPress(action.onPress)}
                  />
                ))}
              </View>

              <View style={styles.linksList}>
                {links.map((link) => (
                  <MenuTextLink
                    key={link.label}
                    label={link.label}
                    onPress={() => handleActionPress(link.onPress)}
                  />
                ))}
              </View>

              {socialActions.length ? (
                <View style={styles.socialRow}>
                  {socialActions.map((action) => (
                    <MenuSocialButton
                      key={action.icon}
                      icon={action.icon}
                      onPress={() => handleActionPress(action.onPress)}
                    />
                  ))}
                </View>
              ) : null}

              {secondaryAction ? (
                <Pressable
                  accessibilityLabel={secondaryAction.label || "Close menu"}
                  onPress={() =>
                    secondaryAction.onPress
                      ? handleActionPress(secondaryAction.onPress)
                      : closeMenu()
                  }
                  style={({ pressed }) => [
                    styles.closeButton,
                    pressed && styles.closeButtonPressed,
                  ]}
                >
                  <Ionicons color={palette.textPrimary} name="chevron-up" size={30} />
                </Pressable>
              ) : null}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  triggerButton: {
    alignItems: "center",
    backgroundColor: "rgba(239,232,216,0.95)",
    borderColor: "rgba(94,86,79,0.36)",
    borderRadius: 24,
    borderWidth: 1.5,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  triggerButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
  modalRoot: {
    backgroundColor: "rgba(19,15,18,0.08)",
    flex: 1,
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: "#F2ECD8",
    alignSelf: "stretch",
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    maxHeight: "88%",
    overflow: "hidden",
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 22,
  },
  statsRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 22,
  },
  statChip: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  statValue: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  topActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  topCircleButton: {
    alignItems: "center",
    borderColor: "rgba(94,86,79,0.82)",
    borderRadius: 24,
    borderWidth: 2,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  circleButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  divider: {
    backgroundColor: "rgba(94,86,79,0.15)",
    height: 1,
    marginTop: 20,
  },
  content: {
    paddingBottom: 18,
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  menuTitle: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2.4,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  settingsList: {
    gap: 22,
  },
  toggleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  toggleLabel: {
    color: "#453F49",
    fontSize: 22,
    fontWeight: "500",
    letterSpacing: 2.2,
    textTransform: "uppercase",
  },
  toggleButtonInactive: {
    alignItems: "center",
    borderColor: "rgba(69,63,73,0.84)",
    borderRadius: 28,
    borderWidth: 2,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  toggleButtonActive: {
    alignItems: "center",
    backgroundColor: "#5A4D5B",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  toggleButtonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.97 }],
  },
  primaryActionsList: {
    gap: 16,
    marginTop: 32,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#564A56",
    paddingHorizontal: 20,
    paddingVertical: 25,
  },
  primaryButtonPressed: {
    opacity: 0.88,
  },
  primaryButtonLabel: {
    color: palette.surface,
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  linksList: {
    alignItems: "center",
    gap: 16,
    marginTop: 34,
  },
  textLink: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  textLinkPressed: {
    opacity: 0.75,
  },
  textLinkLabel: {
    color: "#453F49",
    fontSize: 17,
    fontWeight: "500",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 26,
    marginTop: 34,
  },
  socialButton: {
    alignItems: "center",
    backgroundColor: "#564A56",
    borderRadius: 36,
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  socialButtonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.97 }],
  },
  closeButton: {
    alignItems: "center",
    alignSelf: "center",
    borderColor: "rgba(94,86,79,0.8)",
    borderRadius: 34,
    borderWidth: 2,
    height: 68,
    justifyContent: "center",
    marginTop: 36,
    width: 68,
  },
  closeButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
})
