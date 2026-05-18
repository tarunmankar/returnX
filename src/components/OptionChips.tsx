import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

interface OptionChipsProps<T extends string | number> {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  accentColor?: string;
}

export function OptionChips<T extends string | number>({
  label,
  options,
  value,
  onChange,
  accentColor = COLORS.accent,
}: OptionChipsProps<T>) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <TouchableOpacity
              key={String(option.value)}
              style={[
                styles.chip,
                active && { backgroundColor: accentColor + '22', borderColor: accentColor },
              ]}
              onPress={() => onChange(option.value)}
              activeOpacity={0.75}
            >
              <Text style={[styles.text, active && { color: accentColor }]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  label: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  chip: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
