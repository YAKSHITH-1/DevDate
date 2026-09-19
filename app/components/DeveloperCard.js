import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { COLORS, BORDER_RADIUS, BRUTAL_SHADOWS } from '../styles/theme';

const { width } = Dimensions.get('window');

export default function DeveloperCard({ developer, onPress }) {
  if (!developer) return null;

  const [imgError, setImgError] = React.useState(false);

  // Use the exact comic artwork from screen-ref Phone 2 for Maya, and customized comic frames for others
  const isMaya = developer.name.startsWith('Maya');
  const isAlex = developer.name.startsWith('Alex');

  const CardWrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { activeOpacity: 0.92, onPress } : {};

  return (
    <CardWrapper {...wrapperProps} style={[styles.cardContainer, BRUTAL_SHADOWS.card]}>
      {/* 1. TOP COMIC ILLUSTRATION */}
      <View style={styles.imageContainer}>
        {/* Match Percentage Sticker */}
        {developer.matchScore ? (
          <View style={styles.cardMatchBadge}>
            <Text style={styles.cardMatchBadgeText}>⚡ {developer.matchScore}% MATCH</Text>
          </View>
        ) : null}

        {isMaya ? (
          <Image
            source={require('../assets/maya_card_art.png')}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : isAlex ? (
          <Image
            source={require('../assets/alex_banner_clean.png')}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.customImageWrap}>
            {!imgError && developer.avatar ? (
              <Image
                source={{ uri: developer.avatar }}
                style={styles.cardImage}
                onError={() => setImgError(true)}
              />
            ) : (
              <View style={[styles.cardImage, styles.cardFallbackImage]}>
                <Text style={styles.cardFallbackInitial}>
                  {developer.name?.charAt(0)?.toUpperCase() || '👤'}
                </Text>
              </View>
            )}
            {developer.sticker && (
              <View style={styles.customStickyNote}>
                <Text style={styles.customStickyText}>{developer.sticker}</Text>
              </View>
            )}
            <View style={styles.deckCounter}>
              <Text style={styles.deckCounterText}>TOP MATCH</Text>
            </View>
          </View>
        )}
      </View>

      {/* 2. CARD CONTENT DETAILS (EXACT MATCH TO PHONE 2) */}
      <View style={styles.cardBody}>
        {/* Name with Green Online Indicator Dot */}
        <View style={styles.nameRow}>
          <Text style={styles.devName}>{developer.name}, {developer.age}</Text>
          <View style={styles.onlineDot} />
        </View>

        {/* Developer Role */}
        <Text style={styles.devRole}>{developer.role}</Text>

        {/* Location with Pin */}
        <Text style={styles.locationText}>📍 {developer.location}</Text>

        {/* Tech Stack Pills (Light Blue with Crisp Border) */}
        <View style={styles.tagsRow}>
          {developer.skills?.map((skill) => (
            <View key={skill} style={styles.tagPill}>
              <Text style={styles.tagPillText}>{skill}</Text>
            </View>
          ))}
        </View>

        {/* Bio Text */}
        <Text style={styles.bioText}>
          {developer.bio}
        </Text>
      </View>
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    height: 310,
    position: 'relative',
    backgroundColor: '#FAF6EB',
    borderBottomWidth: 2.5,
    borderBottomColor: '#000000',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  customImageWrap: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  customStickyNote: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#FDE047',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    transform: [{ rotate: '-4deg' }],
  },
  customStickyText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000000',
  },
  deckCounter: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  deckCounterText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  devName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.2,
  },
  onlineDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#22C55E',
  },
  devRole: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tagPill: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 11,
    paddingVertical: 4,
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
  },
  bioText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    lineHeight: 18,
  },
  cardMatchBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FDE047',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    zIndex: 10,
  },
  cardMatchBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  cardFallbackImage: {
    backgroundColor: '#FFE600',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFallbackInitial: {
    fontSize: 64,
    fontWeight: '900',
    color: '#000000',
  },
});
