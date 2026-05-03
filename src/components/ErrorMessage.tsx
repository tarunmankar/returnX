/**
 * ReturnX - Input Error & Toast Components
 * Inline validation errors + Toast notifications
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

// ─── Inline Error Message ─────────────────────────────────────────────────────

interface ErrorMessageProps {
  message: string | null;
  visible?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, visible = true }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: message && visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [message, visible]);

  if (!message) return null;

  return (
    <Animated.View style={[styles.errorContainer, { opacity: anim }]}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorText}>{message}</Text>
    </Animated.View>
  );
};

// ─── Toast Notification ───────────────────────────────────────────────────────

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  visible: boolean;
  onHide?: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  visible,
  onHide,
  duration = 2500,
}) => {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 8 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: 100, duration: 250, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]).start(() => onHide?.());
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const bgColor = {
    success: COLORS.accent,
    error: COLORS.risk,
    info: COLORS.primaryLight,
  }[type];

  const icon = { success: '✅', error: '❌', info: 'ℹ️' }[type];

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: bgColor, transform: [{ translateY }], opacity },
      ]}
    >
      <Text style={styles.toastIcon}>{icon}</Text>
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

// ─── Input Validation Helper ──────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateInputs(fields: Record<string, { value: number; label: string; min?: number; max?: number }>): ValidationResult {
  const errors: Record<string, string> = {};
  for (const [key, field] of Object.entries(fields)) {
    if (isNaN(field.value) || field.value <= 0) {
      errors[key] = `${field.label} sahi se bharein`;
    } else if (field.min !== undefined && field.value < field.min) {
      errors[key] = `${field.label} kam se kam ${field.min} hona chahiye`;
    } else if (field.max !== undefined && field.value > field.max) {
      errors[key] = `${field.label} zyada se zyada ${field.max} ho sakta hai`;
    }
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

// ─── Rate Quick Select (Indian Benchmarks) ───────────────────────────────────

interface RateQuickSelectProps {
  rates: { label: string; rate: number }[];
  onSelect: (rate: number) => void;
  title?: string;
}

export const RateQuickSelect: React.FC<RateQuickSelectProps> = ({ rates, onSelect, title }) => {
  const { TouchableOpacity } = require('react-native');
  return (
    <View style={styles.rateContainer}>
      {title && <Text style={styles.rateTitle}>{title}</Text>}
      <View style={styles.rateRow}>
        {rates.map((item, i) => (
          <TouchableOpacity key={i} style={styles.rateChip} onPress={() => onSelect(item.rate)} activeOpacity={0.7}>
            <Text style={styles.rateChipLabel}>{item.label}</Text>
            <Text style={styles.rateChipValue}>{item.rate}%</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(213, 0, 0, 0.1)',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.risk + '55',
    gap: SPACING.xs,
  },
  errorIcon: { fontSize: 14 },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.risk,
    flex: 1,
  },
  toast: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  toastIcon: { fontSize: 16 },
  toastText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    flex: 1,
  },
  rateContainer: { marginBottom: SPACING.md },
  rateTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  rateRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  rateChip: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  rateChipLabel: { fontSize: 9, color: COLORS.textMuted, letterSpacing: 0.3 },
  rateChipValue: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.accent, fontWeight: TYPOGRAPHY.fontWeight.bold },
});
