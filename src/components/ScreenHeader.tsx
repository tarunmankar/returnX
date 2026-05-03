/**
 * ReturnX - ScreenHeader Component
 * Reusable header for all calculator screens
 * Shows back button + mini logo + title + subtitle
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LogoIcon } from './LogoIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  accentColor?: string;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  accentColor = COLORS.accent,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top + SPACING.sm, SPACING.xl) }]}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      {/* Mini Logo */}
      <View style={[styles.miniLogo, { borderColor: accentColor + '44' }]}>
        <LogoIcon size={22} />
      </View>

      {/* Title Block */}
      <View style={styles.titleBlock}>
        <Text style={styles.screenTitle}>{title}</Text>
        {subtitle && <Text style={styles.screenSubtitle}>{subtitle}</Text>}
      </View>

      {/* ReturnX brand (small, right side) */}
      <Text style={styles.brand}>ReturnX</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.base,
    backgroundColor: COLORS.primary,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    lineHeight: 22,
  },
  miniLogo: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
  },
  screenTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  brand: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.accent,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    opacity: 0.7,
    letterSpacing: 0.5,
  },
});

export default ScreenHeader;
