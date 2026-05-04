/**
 * ReturnX - RiskBadge Component
 * Dynamic risk level chip based on interest rate
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';
import { useAppStore } from '../store/appStore';

type RiskLevel = 'Low Risk' | 'Medium Risk' | 'High Risk Warning';

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
      level: 'Low Risk',
      emoji: '🟢',
      color: COLORS.conservative,
      bgColor: 'rgba(0, 200, 83, 0.12)',
      description: 'Low risk, stable returns. Ideal for capital preservation.',
    };
  } else if (rate <= moderateThreshold) {
    return {
      level: 'Medium Risk',
      emoji: '🟡',
      color: COLORS.moderate,
      bgColor: 'rgba(255, 214, 0, 0.12)',
      description: 'Balanced risk-reward. Suitable for medium-term goals.',
    };
  } else {
    return {
      level: 'High Risk Warning',
      emoji: '⚠️',
      color: '#FFFFFF',
      bgColor: COLORS.risk,
      description: 'High risk! Ensure this aligns with your risk tolerance.',
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
      <View style={[styles.badge, { backgroundColor: risk.bgColor, borderColor: risk.level === 'High Risk Warning' ? risk.bgColor : risk.color }]}>
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
