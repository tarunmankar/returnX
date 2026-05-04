import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

interface ResultActionsProps {
  onSave?: () => void;
  onShare?: () => void;
}

export const ResultActions: React.FC<ResultActionsProps> = ({ onSave, onShare }) => {
  if (!onSave && !onShare) return null;

  return (
    <View style={styles.container}>
      {onSave && (
        <TouchableOpacity style={styles.actionBtn} onPress={onSave} activeOpacity={0.7}>
          <Text style={styles.actionIcon}>💾</Text>
          <Text style={styles.actionText}>Save</Text>
        </TouchableOpacity>
      )}
      {onShare && (
        <TouchableOpacity style={[styles.actionBtn, styles.shareBtn]} onPress={onShare} activeOpacity={0.7}>
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.base,
    gap: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceCard,
    paddingVertical: SPACING.base,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  shareBtn: {
    backgroundColor: COLORS.surface,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});
