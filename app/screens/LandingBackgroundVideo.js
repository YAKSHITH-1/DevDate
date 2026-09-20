import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Asset } from 'expo-asset';

/**
 * Native implementation of LandingBackgroundVideo (iOS / Android).
 * Uses expo-video with caching enabled and local storage asset acceleration.
 */
export default function LandingBackgroundVideo({ source, style, onLoad, isActive = true }) {
  // Check if asset is already cached locally on device
  let initialSource = source;
  try {
    const asset = Asset.fromModule(source);
    if (asset?.localUri) {
      initialSource = { uri: asset.localUri };
    } else if (typeof source === 'number') {
      initialSource = { assetId: source, useCaching: true };
    }
  } catch (e) {}

  const player = useVideoPlayer(initialSource, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  // Background download to ensure immediate disk cache
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const asset = Asset.fromModule(source);
        if (!asset.localUri) {
          await asset.downloadAsync();
        }
        if (isMounted && asset.localUri && player) {
          if (typeof player.replaceAsync === 'function') {
            await player.replaceAsync({ uri: asset.localUri });
          } else if (typeof player.replace === 'function') {
            player.replace({ uri: asset.localUri });
          }
        }
      } catch (e) {}
    })();
    return () => {
      isMounted = false;
    };
  }, [player, source]);

  useEffect(() => {
    if (!player) return;
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  useEffect(() => {
    if (!player) return;
    const subscription = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay' && onLoad) {
        onLoad();
      }
    });

    if (player.status === 'readyToPlay' && onLoad) {
      onLoad();
    }

    return () => {
      subscription?.remove?.();
    };
  }, [player, onLoad]);

  return (
    <View style={[styles.container, style]}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
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
