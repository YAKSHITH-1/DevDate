import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Animated,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Asset } from 'expo-asset';

const SPLASH_DURATION_MS = 3500; // Plays for ~3.5 seconds (in 3-4s range)
const FADE_DURATION_MS = 350; // Smooth transition fade-out

/**
 * Native Video Splash Screen for DevDate (iOS & Android).
 * Plays assets/DevDate_portrait_splash_5s.mp4 for 3-4 seconds,
 * then smoothly fades out into the main application.
 */
export default function VideoSplashScreen({ onFinish }) {
  const [hasFinished, setHasFinished] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const finishedRef = useRef(false);

  const videoSource = require('../assets/DevDate_portrait_splash_5s.mp4');

  // Check if asset is already cached locally on device
  let initialSource = videoSource;
  try {
    const asset = Asset.fromModule(videoSource);
    if (asset?.localUri) {
      initialSource = { uri: asset.localUri };
    } else if (typeof videoSource === 'number') {
      initialSource = { assetId: videoSource, useCaching: true };
    }
  } catch (e) {}

  const player = useVideoPlayer(initialSource, (p) => {
    p.loop = false;
    p.muted = false;
    p.play();
  });

  const finishSplash = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: FADE_DURATION_MS,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      try {
        if (player) {
          player.pause();
        }
      } catch (e) {}
      setHasFinished(true);
      if (onFinish) onFinish();
    });
  };

  useEffect(() => {
    let isMounted = true;

    // Background download to ensure disk cache acceleration
    (async () => {
      try {
        const asset = Asset.fromModule(videoSource);
        if (!asset.localUri) {
          await asset.downloadAsync();
        }
        if (isMounted && asset.localUri && player) {
          if (typeof player.replaceAsync === 'function') {
            await player.replaceAsync({ uri: asset.localUri });
          } else if (typeof player.replace === 'function') {
            player.replace({ uri: asset.localUri });
          }
          player.play();
        }
      } catch (e) {}
    })();

    // Auto-dismiss after 3.5 seconds (plays 3-4 seconds as requested)
    const timer = setTimeout(() => {
      if (isMounted) {
        finishSplash();
      }
    }, SPLASH_DURATION_MS);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [player]);

  if (hasFinished) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar hidden={true} />
      <TouchableOpacity
        activeOpacity={1}
        onPress={finishSplash}
        style={styles.touchable}
      >
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
        />
        {/* Subtle tap to skip pill */}
        <View style={styles.skipPill}>
          <Text style={styles.skipText}>SKIP →</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FAF6EB',
    zIndex: 99999,
  },
  touchable: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  skipPill: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: 'rgba(24, 24, 27, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
