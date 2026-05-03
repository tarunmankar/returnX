/**
 * ReturnX - FrequencySelector Component
 * Segmented button selector for compounding frequency
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

export type Frequency = 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly';

export const FREQUENCY_MAP: Record<Frequency, number> = {
  Monthly: 12,
  Quarterly: 4,
  'Half-Yearly': 2,
  Yearly: 1,
};

interface FrequencySelectorProps {
  label?: string;
  value: Frequency;
  onChange: (freq: Frequency) => void;
  options?: Frequency[];
}

export const FrequencySelector: React.FC<FrequencySelectorProps> = ({
  label = 'Compounding',
  value,
  onChange,
  options = ['Monthly', 'Quarterly', 'Yearly'],
}) => {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.segmentRow}>
        {options.map((option) => {
          const isSelected = value === option;
          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.segment,
                isSelected && styles.segmentSelected,
                { flex: 1 },
              ]}
              onPress={() => onChange(option)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.segmentText,
                  isSelected && styles.segmentTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  segment: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: {
    backgroundColor: COLORS.accent,
  },
  segmentText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    textAlign: 'center',
  },
  segmentTextSelected: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});

export default FrequencySelector;
