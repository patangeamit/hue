import React from "react"
import { Audio } from "expo-av"
import { useCurrency } from "../state/CurrencyContext"

const backgroundTrack = require("../../assets/music.mp3")

export default function BackgroundMusic() {
  const { isMusicEnabled } = useCurrency()
  const isMusicEnabledRef = React.useRef(isMusicEnabled)
  const soundRef = React.useRef(null)

  isMusicEnabledRef.current = isMusicEnabled

  React.useEffect(() => {
    let isUnmounted = false

    async function loadBackgroundTrack() {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          playThroughEarpieceAndroid: false,
          shouldDuckAndroid: true,
          staysActiveInBackground: false,
        })

        const { sound } = await Audio.Sound.createAsync(backgroundTrack, {
          isLooping: true,
          shouldPlay: isMusicEnabled,
          volume: 0.35,
        })

        if (isUnmounted) {
          await sound.unloadAsync()
          return
        }

        soundRef.current = sound

        if (!isMusicEnabledRef.current) {
          await sound.pauseAsync()
        }
      } catch (error) {
        console.warn("Unable to load background music.", error)
      }
    }

    loadBackgroundTrack()

    return () => {
      isUnmounted = true
      const sound = soundRef.current
      soundRef.current = null

      if (sound) {
        sound.unloadAsync().catch(() => {})
      }
    }
  }, [])

  React.useEffect(() => {
    const sound = soundRef.current

    if (!sound) {
      return
    }

    async function syncPlayback() {
      try {
        if (isMusicEnabled) {
          await sound.playAsync()
          return
        }

        await sound.pauseAsync()
      } catch (error) {
        console.warn("Unable to update background music playback.", error)
      }
    }

    syncPlayback()
  }, [isMusicEnabled])

  return null
}
