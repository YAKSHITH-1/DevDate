import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

function ComicHalftoneBackground({ variant = 'discover' }) {
  return (
    <View style={styles.container} pointerEvents="none">
      {/* 1. Ultra-High-Resolution Comic Art Background with Sunburst Rays, Ben-Day Dots & Speed Lines */}
      <Image
        source={require('../assets/comic_screen_bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
});

export default React.memo(ComicHalftoneBackground);
