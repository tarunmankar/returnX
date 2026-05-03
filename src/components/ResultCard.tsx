/**
 * ReturnX - ResultCard Component
 * Bold result display with ₹ format and breakdown rows
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';
import { formatINR, formatINRShort } from '../utils/format';

interface ResultRow {
  label: string;
  value: number;
  highlight?: boolean;
  color?: string;
  isPercent?: boolean;
  suffix?: string;
}

interface ResultCardProps {
  title: string;
  mainAmount: number;
  mainLabel?: string;
  rows?: ResultRow[];
  style?: ViewStyle;
  accentColor?: string;
  disclaimer?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  title,
  mainAmount,
  mainLabel = 'Total Value',
  rows = [],
  style,
  accentColor = COLORS.accent,
  disclaimer,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [mainAmount]);

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        style,
      ]}
    >
      {/* Header */}
      <View style={[styles.header, { borderLeftColor: accentColor }]}>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Main Amount — Big Display */}
      <View style={[styles.mainAmountContainer, { borderColor: accentColor + '33' }]}>
        <Text style={styles.mainLabel}>{mainLabel}</Text>
        <Text style={[styles.mainAmount, { color: accentColor }]}>
          {formatINR(mainAmount)}
        </Text>
        <View style={styles.mainAmountBadge}>
          <Text style={[styles.mainAmountShort, { color: accentColor }]}>
            {formatINRShort(mainAmount)}
          </Text>
        </View>
      </View>

      {/* Divider */}
      {rows.length > 0 && <View style={styles.divider} />}

      {/* Breakdown rows */}
      {rows.map((row, index) => (
        row.highlight ? (
          // Big highlighted row — Total Value / Total Interest
          <View key={index} style={[styles.highlightRow, { borderColor: (row.color || accentColor) + '33' }]}>
            <Text style={styles.highlightLabel}>{row.label}</Text>
            <Text style={[styles.highlightAmount, { color: row.color || accentColor }]}>
              {row.isPercent
                ? `${row.value.toFixed(2)}%`
                : row.suffix
                ? `${row.value}${row.suffix}`
                : formatINR(row.value)}
            </Text>
            <Text style={[styles.highlightShort, { color: (row.color || accentColor) + 'BB' }]}>
              {formatINRShort(row.value)}
            </Text>
          </View>
        ) : (
          <View key={index} style={styles.row}>
            <Text style={styles.rowLabel}>{row.label}</Text>
            <Text
              style={[
                styles.rowValue,
                row.color && { color: row.color },
              ]}
            >
              {row.isPercent
                ? `${row.value.toFixed(2)}%`
                : row.suffix
                ? `${row.value}${row.suffix}`
                : formatINR(row.value)}
            </Text>
          </View>
        )
      ))}

      {/* Disclaimer */}
      {disclaimer && (
        <Text style={styles.disclaimer}>{disclaimer}</Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    borderLeftWidth: 3,
    paddingLeft: SPACING.sm,
    marginBottom: SPACING.base,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mainAmountContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  mainLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  mainAmount: {
    fontSize: 44,
    fontWeight: TYPOGRAPHY.fontWeight.extrabold,
    letterSpacing: -1.5,
    lineHeight: 52,
  },
  mainAmountBadge: {
    marginTop: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 3,
  },
  mainAmountShort: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  rowLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    flex: 1,
  },
  rowValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  // Big highlighted rows
  highlightRow: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  highlightLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.xs,
  },
  highlightAmount: {
    fontSize: 38,
    fontWeight: TYPOGRAPHY.fontWeight.extrabold,
    letterSpacing: -1,
    lineHeight: 46,
  },
  highlightShort: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  disclaimer: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ResultCard;
