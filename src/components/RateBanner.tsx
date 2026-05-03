/**
 * ReturnX - RateBanner Component
 * Compact inline-editable rate banner. Fully uncontrolled internally.
 */
import React, { useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

interface RateBannerProps {
  defaultRate: string;
  onRateChange: (v: string) => void;
  details?: string;
  accentColor?: string;
}

export const RateBanner: React.FC<RateBannerProps> = ({
  defaultRate,
  onRateChange,
  details,
  accentColor = COLORS.accent,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.banner, { borderColor: accentColor + '44' }]}>
      <View style={[styles.rateBox, focused && { borderColor: accentColor, borderWidth: 2 }]}>
        <View style={styles.rateLabelRow}>
          <Text style={styles.pencilIcon}>✏️</Text>
          <Text style={[styles.rateLabel, { color: accentColor }]}>Rate</Text>
        </View>
        <View style={styles.rateRow}>
          <TextInput
            style={[styles.rateInput, { color: accentColor }]}
            defaultValue={defaultRate}
            onChangeText={onRateChange}
            keyboardType="decimal-pad"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            selectTextOnFocus
            maxLength={6}
            returnKeyType="done"
          />
          <Text style={[styles.rateSuffix, { color: accentColor }]}>% p.a.</Text>
        </View>
      </View>

      {details ? (
        <Text style={styles.details}>{details}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    margin: SPACING.base,
    marginBottom: 0,
    backgroundColor: COLORS.surfaceCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  rateBox: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    minWidth: 140,
  },
  rateLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  pencilIcon: { fontSize: 12 },
  rateLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  rateRow: { flexDirection: 'row', alignItems: 'center' },
  rateInput: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.extrabold,
    padding: 0,
    margin: 0,
    minWidth: 64,
  },
  rateSuffix: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginLeft: 2,
  },
  details: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
    textAlign: 'right',
  },
});
