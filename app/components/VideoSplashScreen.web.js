import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Animated,
  Text,
  Image,
} from 'react-native';

const SPLASH_DURATION_MS = 3500; // Plays for ~3.5 seconds
const FADE_DURATION_MS = 350; // Smooth transition fade-out

/**
 * Web implementation of VideoSplashScreen using HTML5 video.
 */
export default function VideoSplashScreen({ onFinish }) {
  const [hasFinished, setHasFinished] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const finishedRef = useRef(false);
  const videoRef = useRef(null);

  const videoSource = require('../assets/DevDate_portrait_splash_5s.mp4');

  let uri = '';
  if (typeof videoSource === 'string') {
    uri = videoSource;
  } else if (videoSource && typeof videoSource === 'object') {
    uri = videoSource.uri || videoSource.default || '';
  } else if (typeof videoSource === 'number') {
    const resolved = Image.resolveAssetSource ? Image.resolveAssetSource(videoSource) : null;
    uri = resolved?.uri || '';
  }

  const finishSplash = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: FADE_DURATION_MS,
      useNativeDriver: false,
    }).start(() => {
      try {
        if (videoRef.current) {
          videoRef.current.pause();
        }
      } catch (e) {}
      setHasFinished(true);
      if (onFinish) onFinish();
    });
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }

    const timer = setTimeout(() => {
      finishSplash();
    }, SPLASH_DURATION_MS);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (hasFinished) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar hidden={true} />
      <div
        onClick={finishSplash}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          cursor: 'pointer',
          backgroundColor: '#FAF6EB',
        }}
      >
        <video
          ref={videoRef}
          src={uri}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            backgroundColor: '#FAF6EB',
          }}
        />
        <View style={styles.skipPill}>
          <Text style={styles.skipText}>SKIP →</Text>
        </View>
      </div>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FAF6EB',
    zIndex: 99999,
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
    zIndex: 10,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
