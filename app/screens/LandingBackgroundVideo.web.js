import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image } from 'react-native';

/**
 * Web implementation of LandingBackgroundVideo.
 * Uses native HTML5 <video> element for maximum performance,
 * perfect looping, zero native dependencies, and no SharedObject issues.
 */
export default function LandingBackgroundVideo({ source, style, onLoad, isActive = true }) {
  const videoRef = useRef(null);

  // Resolve source asset to URL
  let uri = '';
  if (typeof source === 'string') {
    uri = source;
  } else if (source && typeof source === 'object') {
    uri = source.uri || source.default || '';
  } else if (typeof source === 'number') {
    const resolved = Image.resolveAssetSource ? Image.resolveAssetSource(source) : null;
    uri = resolved?.uri || '';
  }

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (isActive) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [isActive]);

  return (
    <View style={[styles.container, style]}>
      <video
        ref={videoRef}
        src={uri}
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={onLoad}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          border: 'none',
          outline: 'none',
          pointerEvents: 'none',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
});
