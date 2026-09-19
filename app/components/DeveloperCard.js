import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { COLORS, BORDER_RADIUS, BORDERS, BRUTAL_SHADOWS } from '../styles/theme';
import { DoodleStar, DoodleSparkle, DoodleUnderline, DoodleCode, DoodleArrow } from './DoodleElements';

const { width } = Dimensions.get('window');

// Rotating accent colors for skill chips — consistent system, not random
const SKILL_COLORS = [
  { bg: COLORS.pillBlue, border: COLORS.pillBlueBorder },
  { bg: COLORS.pillYellow, border: COLORS.pillYellowBorder },
  { bg: COLORS.pillGreen, border: COLORS.pillGreenBorder },
  { bg: COLORS.purplePastel, border: COLORS.purple },
  { bg: COLORS.pillCoral, border: COLORS.pillCoralBorder },
  { bg: COLORS.orangePastel, border: COLORS.orange },
];

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
      {/* 1. TOP IMAGE / AVATAR AREA */}
      <View style={styles.imageContainer}>
        {/* Match Percentage Sticker */}
        {developer.matchScore ? (
          <View style={styles.cardMatchBadge}>
            <DoodleSparkle size={10} color={COLORS.ink} style={{ marginRight: 4 }} />
            <Text style={styles.cardMatchBadgeText}>{developer.matchScore}% MATCH</Text>
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
                {/* Doodle circle frame behind initial */}
                <View style={styles.fallbackCircle}>
                  <Text style={styles.cardFallbackInitial}>
                    {developer.name?.charAt(0)?.toUpperCase() || 'D'}
                  </Text>
                </View>
                {/* Corner doodle accent */}
                <View style={styles.fallbackDoodleAccent}>
                  <DoodleCode symbol="</>" color="rgba(24,24,27,0.12)" bgColor="transparent" />
                </View>
              </View>
            )}
            {developer.sticker && (
              <View style={styles.customStickyNote}>
                <Text style={styles.customStickyText}>{developer.sticker}</Text>
              </View>
            )}
            <View style={styles.deckCounter}>
              <DoodleStar size={8} color={COLORS.white} style={{ marginRight: 4 }} />
              <Text style={styles.deckCounterText}>TOP MATCH</Text>
            </View>
          </View>
        )}

        {/* Decorative doodle sparkle on image corner */}
        <View style={styles.imageDoodleAccent}>
          <DoodleStar size={12} color={COLORS.yellow} />
        </View>
      </View>

      {/* 2. CARD BODY */}
      <View style={styles.cardBody}>
        {/* Name with Green Online Indicator Dot */}
        <View style={styles.nameRow}>
          <Text style={styles.devName}>{developer.name}, {developer.age}</Text>
          <View style={styles.onlineDot} />
        </View>

        {/* Hand-drawn underline under name */}
        <DoodleUnderline width={80} height={3} color={COLORS.yellow} style={{ marginBottom: 4 }} />

        {/* Developer Role with code tag prefix */}
        <View style={styles.roleRow}>
          <DoodleCode symbol="</>" color={COLORS.textMuted} bgColor="transparent" style={styles.roleCodeTag} />
          <Text style={styles.devRole}>{developer.role}</Text>
        </View>

        {/* Location */}
        <View style={styles.locationRow}>
          <DoodleArrow direction="right" size={12} color={COLORS.textLight} style={{ marginRight: 4 }} />
          <Text style={styles.locationText}>{developer.location}</Text>
        </View>

        {/* Tech Stack Pills — Varied Pop Art accent colors */}
        <View style={styles.tagsRow}>
          {developer.skills?.map((skill, index) => {
            const colorSet = SKILL_COLORS[index % SKILL_COLORS.length];
            return (
              <View
                key={skill}
                style={[
                  styles.tagPill,
                  {
                    backgroundColor: colorSet.bg,
                    borderColor: COLORS.borderBlack,
                  },
                ]}
              >
                <Text style={styles.tagPillText}>{skill}</Text>
              </View>
            );
          })}
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
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.borderBlack,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    height: 310,
    position: 'relative',
    backgroundColor: COLORS.creamBg,
    borderBottomWidth: BORDERS.thick,
    borderBottomColor: COLORS.borderBlack,
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
    backgroundColor: COLORS.yellow,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 3,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    transform: [{ rotate: '-4deg' }],
    ...BRUTAL_SHADOWS.xs,
  },
  customStickyText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.ink,
  },
  deckCounter: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ink,
    borderWidth: 1.5,
    borderColor: COLORS.borderBlack,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  deckCounterText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 0.4,
  },
  imageDoodleAccent: {
    position: 'absolute',
    bottom: 8,
    right: 10,
    opacity: 0.6,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
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
    color: COLORS.ink,
    letterSpacing: 0.3,
  },
  onlineDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.greenOnline,
    borderWidth: 1.5,
    borderColor: COLORS.borderBlack,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  roleCodeTag: {
    marginRight: 6,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  devRole: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tagPill: {
    borderWidth: 1.5,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.ink,
  },
  bioText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  cardMatchBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.yellow,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    ...BRUTAL_SHADOWS.xs,
    zIndex: 10,
  },
  cardMatchBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  cardFallbackImage: {
    backgroundColor: COLORS.creamBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.yellow,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.borderBlack,
    justifyContent: 'center',
    alignItems: 'center',
    ...BRUTAL_SHADOWS.sm,
  },
  cardFallbackInitial: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.ink,
  },
  fallbackDoodleAccent: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    opacity: 0.3,
  },
});
