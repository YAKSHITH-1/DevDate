import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, BRUTAL_SHADOWS } from '../styles/theme';
import ComicBadge from '../components/ComicBadge';

export default function ProfileScreen({ onPublishProject }) {
  const [copiedLink, setCopiedLink] = useState(null);

  const handleCopy = (label) => {
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 1500);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DEVELOPER HERO</Text>
        <ComicBadge text="STANFORD BUILDER" color={COLORS.pink} textColor={COLORS.white} rotate="2deg" size="sm" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Hero Card */}
        <View style={[styles.heroCard, BRUTAL_SHADOWS.md]}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarBorder}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' }}
                style={styles.avatar}
              />
              <View style={[styles.statusBadge, BRUTAL_SHADOWS.xs]}>
                <Text style={styles.statusText}>READY TO COLLAB</Text>
              </View>
            </View>

            <Text style={styles.heroName}>RAHUL PATEL</Text>
            <View style={[styles.rolePill, BRUTAL_SHADOWS.xs]}>
              <Text style={styles.roleText}>LEAD BUILDER • CS '25</Text>
            </View>

            <Text style={styles.bioText}>
              Building agentic AI tools, distributed micro-apps, and full-stack systems. Looking for designers and ML researchers for Stanford Hack 2026.
            </Text>
          </View>

          {/* Stats Bar */}
          <View style={styles.statsRow}>
            <View style={[styles.statBox, BRUTAL_SHADOWS.xs]}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>ACTIVE SQUADS</Text>
            </View>
            <View style={[styles.statBox, BRUTAL_SHADOWS.xs]}>
              <Text style={styles.statNumber}>94%</Text>
              <Text style={styles.statLabel}>AVG MATCH</Text>
            </View>
            <View style={[styles.statBox, BRUTAL_SHADOWS.xs]}>
              <Text style={styles.statNumber}>180+</Text>
              <Text style={styles.statLabel}>USERS IMPACTED</Text>
            </View>
          </View>
        </View>

        {/* Technical Arsenal Card */}
        <View style={[styles.sectionCard, BRUTAL_SHADOWS.md]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}> TECHNICAL ARSENAL</Text>
            <ComicBadge text="VERIFIED" color={COLORS.lime} textColor={COLORS.black} size="sm" />
          </View>

          <View style={styles.tagsContainer}>
            {['REACT NATIVE', 'TYPESCRIPT', 'FASTAPI', 'PYTHON', 'OPENAI', 'MONGODB', 'SOCKET.IO', 'DOCKER'].map((skill, i) => (
              <View
                key={skill}
                style={[
                  styles.skillTag,
                  i % 3 === 0 && { backgroundColor: COLORS.yellow },
                  i % 3 === 1 && { backgroundColor: COLORS.cyan },
                  i % 3 === 2 && { backgroundColor: COLORS.white },
                  BRUTAL_SHADOWS.xs,
                ]}
              >
                <Text style={styles.skillTagText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Portfolio & External Links */}
        <View style={[styles.sectionCard, BRUTAL_SHADOWS.md]}>
          <Text style={styles.sectionTitle}> PROOF OF WORK</Text>

          <View style={styles.linksList}>
            {[
              { label: 'GitHub', value: 'github.com/rahulpatel', icon: '' },
              { label: 'Portfolio', value: 'rahulpatel.dev', icon: '' },
              { label: 'LinkedIn', value: 'linkedin.com/in/rahulpatel', icon: '' },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.8}
                onPress={() => handleCopy(item.label)}
                style={[styles.linkRow, BRUTAL_SHADOWS.xs]}
              >
                <View style={styles.linkLeft}>
                  <Text style={styles.linkIcon}>{item.icon}</Text>
                  <View>
                    <Text style={styles.linkLabel}>{item.label}</Text>
                    <Text style={styles.linkValue}>{item.value}</Text>
                  </View>
                </View>
                <Text style={styles.copyBtnText}>
                  {copiedLink === item.label ? 'COPIED! ✓' : 'COPY ↗'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Publish Project Action Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => Alert.alert('Publish Project', 'Opening Project Creation Studio for Stanford Hack...')}
          style={[styles.publishProjectBtn, BRUTAL_SHADOWS.md]}
        >
          <Text style={styles.publishProjectBtnText}>+ CREATE & PUBLISH SQUAD</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.creamBg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.yellow,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 3.5,
    borderBottomColor: COLORS.black,
  },
  headerTitle: {
    fontSize: FONTS.xl,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: SPACING.md,
    gap: 16,
    paddingBottom: 30,
  },
  heroCard: {
    backgroundColor: COLORS.white,
    borderWidth: 3.5,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    width: '100%',
  },
  avatarBorder: {
    position: 'relative',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3.5,
    borderColor: COLORS.black,
    backgroundColor: COLORS.yellow,
    padding: 3,
    marginBottom: 10,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 44,
  },
  statusBadge: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    backgroundColor: COLORS.lime,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.black,
  },
  heroName: {
    fontSize: FONTS['3xl'],
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: 0.5,
    marginTop: 8,
  },
  rolePill: {
    backgroundColor: COLORS.yellow,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginTop: 4,
    marginBottom: 8,
  },
  roleText: {
    fontSize: FONTS.xs + 1,
    fontWeight: '900',
    color: COLORS.black,
  },
  bioText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 4,
    paddingHorizontal: 10,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFBEA',
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONTS.xl,
    fontWeight: '900',
    color: COLORS.black,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.darkGray,
    marginTop: 2,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderWidth: 3.5,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: FONTS.sm + 2,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: 0.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  skillTagText: {
    fontSize: FONTS.xs,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: 0.4,
  },
  linksList: {
    gap: 8,
    marginTop: 10,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFBEA',
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  linkIcon: {
    fontSize: 20,
  },
  linkLabel: {
    fontSize: FONTS.xs,
    fontWeight: '900',
    color: COLORS.black,
  },
  linkValue: {
    fontSize: FONTS.xs - 1,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  copyBtnText: {
    fontSize: FONTS.xs,
    fontWeight: '900',
    color: COLORS.pink,
  },
  publishProjectBtn: {
    backgroundColor: COLORS.lime,
    borderWidth: 3.5,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: 14,
    alignItems: 'center',
  },
  publishProjectBtnText: {
    fontSize: FONTS.sm + 2,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: 0.5,
  },
});