/**
 * ReturnX - AdBannerPlaceholder Component
 * Fixed-height reserved space for future AdMob banners
 * Prevents Cumulative Layout Shift (CLS) when ads load
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

type AdSize = 'banner' | 'medium_rectangle' | 'large_banner';

const AD_HEIGHTS: Record<AdSize, number> = {
  banner: 50,
  large_banner: 100,
  medium_rectangle: 250,
};

interface AdBannerPlaceholderProps {
  size?: AdSize;
  showPlaceholderUI?: boolean; // Only show in dev/debug
}

export const AdBannerPlaceholder: React.FC<AdBannerPlaceholderProps> = ({
  size = 'banner',
  showPlaceholderUI = false, // Set to __DEV__ in future
}) => {
  const height = AD_HEIGHTS[size];

  return (
    <View style={[styles.container, { height }]}>
      {showPlaceholderUI && (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>AD SPACE — {height}px</Text>
        </View>
      )}
      {/* When AdMob is integrated, replace content with:
          <BannerAd unitId={adUnitId} size={BannerAdSize.BANNER} />
      */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    // No background — transparent by default so layout is reserved but invisible
  },
  placeholder: {
    flex: 1,
    backgroundColor: COLORS.surfaceCard,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.base,
  },
  placeholderText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
});

export default AdBannerPlaceholder;
