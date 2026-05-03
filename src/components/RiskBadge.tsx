/**
 * ReturnX - RiskBadge Component
 * Dynamic risk level chip based on interest rate
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';
import { useAppStore } from '../store/appStore';

type RiskLevel = 'Conservative' | 'Moderate Risk' | 'Aggressive / High Risk';

interface RiskBadgeProps {
  rate: number;
  showDescription?: boolean;
}

function getRiskLevel(rate: number, conservativeThreshold: number, moderateThreshold: number): {
  level: RiskLevel;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
} {
  if (rate <= conservativeThreshold) {
    return {
      level: 'Conservative',
      emoji: '🟢',
      color: COLORS.conservative,
      bgColor: 'rgba(0, 200, 83, 0.12)',
      description: 'Low risk, stable returns. Ideal for capital preservation.',
    };
  } else if (rate <= moderateThreshold) {
    return {
      level: 'Moderate Risk',
      emoji: '🟡',
      color: COLORS.moderate,
      bgColor: 'rgba(255, 214, 0, 0.12)',
      description: 'Balanced risk-reward. Suitable for medium-term goals.',
    };
  } else {
    return {
      level: 'Aggressive / High Risk',
      emoji: '🔴',
      color: COLORS.aggressive,
      bgColor: 'rgba(213, 0, 0, 0.12)',
      description: 'High potential returns but significant volatility.',
    };
  }
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ rate, showDescription = false }) => {
  const { settings } = useAppStore();
  const { conservative, moderate } = settings.riskThresholds;

  if (rate <= 0) return null;

  const risk = getRiskLevel(rate, conservative, moderate);

  return (
    <View>
      <View style={[styles.badge, { backgroundColor: risk.bgColor, borderColor: risk.color }]}>
        <Text style={styles.emoji}>{risk.emoji}</Text>
        <Text style={[styles.label, { color: risk.color }]}>{risk.level}</Text>
        <Text style={[styles.rate, { color: risk.color }]}>{rate}%</Text>
      </View>
      {showDescription && (
        <Text style={styles.description}>{risk.description}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  emoji: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    letterSpacing: 0.3,
  },
  rate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    opacity: 0.8,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});

export default RiskBadge;
