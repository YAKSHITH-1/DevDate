import React, { useRef, useEffect } from 'react';
import { View, Animated, PanResponder, StyleSheet, Text, Dimensions } from 'react-native';
import { COLORS, BORDERS, BRUTAL_SHADOWS } from '../styles/theme';
import { DoodleCheck, DoodleCross } from './DoodleElements';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 80;

export default function SwipeableCard({ children, onSwipeLeft, onSwipeRight, cardKey }) {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const enterScale = useRef(new Animated.Value(0.96)).current;
  const enterOpacity = useRef(new Animated.Value(0.75)).current;

  // Smooth deck entrance animation whenever card changes (e.g. next card or rewind)
  useEffect(() => {
    pan.setValue({ x: 0, y: 0 });
    enterScale.setValue(0.96);
    enterOpacity.setValue(0.75);

    Animated.parallel([
      Animated.spring(enterScale, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: false,
      }),
      Animated.timing(enterOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  }, [cardKey]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => {
        // Smoothly activate only when horizontal drag exceeds vertical motion
        return Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy);
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        const isFlick = Math.abs(gesture.vx) > 0.45;
        const isFar = Math.abs(gesture.dx) > SWIPE_THRESHOLD;

        if (gesture.dx > 0 && (isFar || isFlick)) {
          // Smooth glide out to the right (LIKE)
          Animated.timing(pan, {
            toValue: { x: SCREEN_WIDTH + 120, y: gesture.dy * 1.1 },
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            onSwipeRight && onSwipeRight();
          });
        } else if (gesture.dx < 0 && (isFar || isFlick)) {
          // Smooth glide out to the left (PASS)
          Animated.timing(pan, {
            toValue: { x: -SCREEN_WIDTH - 120, y: gesture.dy * 1.1 },
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            onSwipeLeft && onSwipeLeft();
          });
        } else {
          // Gentle spring return to center (no jarring bounce)
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 6,
            tension: 50,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  // Gentle, organic tilt as card moves
  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-12deg', '0deg', '12deg'],
    extrapolate: 'clamp',
  });

  // Smooth stamp fade-in
  const likeOpacity = pan.x.interpolate({
    inputRange: [15, 75],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = pan.x.interpolate({
    inputRange: [-75, -15],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.card,
          {
            opacity: enterOpacity,
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { rotate },
              { scale: enterScale },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Swipe Right Stamp — INVITE */}
        <Animated.View
          pointerEvents="none"
          style={[styles.stamp, styles.inviteStamp, { opacity: likeOpacity }]}
        >
          <DoodleCheck size={16} color={COLORS.ink} style={{ marginRight: 4 }} />
          <Text style={styles.inviteStampText}>INVITE!</Text>
        </Animated.View>

        {/* Swipe Left Stamp — PASS */}
        <Animated.View
          pointerEvents="none"
          style={[styles.stamp, styles.passStamp, { opacity: nopeOpacity }]}
        >
          <Text style={styles.passStampText}>PASS!</Text>
          <DoodleCross size={14} color={COLORS.white} style={{ marginLeft: 4 }} />
        </Animated.View>

        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    position: 'relative',
  },
  stamp: {
    position: 'absolute',
    top: 22,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.borderBlack,
    ...BRUTAL_SHADOWS.sm,
  },
  inviteStamp: {
    left: 18,
    backgroundColor: COLORS.lime,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 12,
    transform: [{ rotate: '-10deg' }],
  },
  inviteStampText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 1,
  },
  passStamp: {
    right: 18,
    backgroundColor: COLORS.coral,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 7,
    transform: [{ rotate: '10deg' }],
  },
  passStampText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1,
  },
});

