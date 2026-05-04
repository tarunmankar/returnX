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
  TouchableOpacity,
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
  onSave?: () => void;
  onShare?: () => void;
  principalAmount?: number;
  interestAmount?: number;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  title,
  mainAmount,
  mainLabel = 'Total Value',
  rows = [],
  style,
  accentColor = COLORS.chart3,
  disclaimer,
  onSave,
  onShare,
  principalAmount,
  interestAmount,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const amountScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Card entrance
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

    // Amount pop animation
    amountScaleAnim.setValue(0.85);
    Animated.spring(amountScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 120,
      friction: 5,
    }).start();
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
      <Animated.View style={[
        styles.mainAmountContainer, 
        { borderColor: accentColor + '33', transform: [{ scale: amountScaleAnim }] }
      ]}>
        <Text style={styles.mainLabel}>{mainLabel}</Text>
        <Text style={[styles.mainAmount, { color: accentColor }]}>
          {formatINR(mainAmount)}
        </Text>
        <View style={styles.mainAmountBadge}>
          <Text style={[styles.mainAmountShort, { color: accentColor }]}>
            {formatINRShort(mainAmount)}
          </Text>
        </View>
      </Animated.View>

      {/* Breakdown Strip — Principal + Interest */}
      {(principalAmount !== undefined && interestAmount !== undefined) && (
        <View style={styles.breakdownStrip}>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Principal</Text>
            <Text style={styles.breakdownValue}>{formatINRShort(principalAmount)}</Text>
          </View>
          <Text style={styles.breakdownPlus}>+</Text>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Interest</Text>
            <Text style={[styles.breakdownValue, { color: accentColor }]}>{formatINRShort(interestAmount)}</Text>
          </View>
          <Text style={styles.breakdownPlus}>=</Text>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Total</Text>
            <Text style={[styles.breakdownValue, styles.breakdownTotal, { color: accentColor }]}>
              {formatINRShort(principalAmount + interestAmount)}
            </Text>
          </View>
        </View>
      )}

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
    paddingBottom: SPACING.xs,
    marginBottom: SPACING.base,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
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
    fontWeight: TYPOGRAPHY.fontWeight.bold,
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
  breakdownStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  breakdownValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  breakdownTotal: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.extrabold,
  },
  breakdownPlus: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
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
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
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
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shareBtn: {
    backgroundColor: '#25D366' + '22',
    borderColor: '#25D366',
  },
  actionIcon: {
    fontSize: 16,
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
});

export default ResultCard;
