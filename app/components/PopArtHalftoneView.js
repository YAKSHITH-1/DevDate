import React from 'react';
import { StyleSheet, ImageBackground } from 'react-native';
import { POP_PALETTE } from '../styles/theme';

export default function PopArtHalftoneView({ children, style }) {
  return (
    <ImageBackground
      source={require('../assets/comic_screen_bg.png')}
      resizeMode="cover"
      style={[styles.container, { backgroundColor: POP_PALETTE.canvasCream }, style]}
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
