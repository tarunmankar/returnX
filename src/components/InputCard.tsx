/**
 * ReturnX - InputCard Component
 * Keeps local input responsive and syncs with parent updates
 * (for preset chips / quick-fill interactions).
 */
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

interface InputCardProps {
  label: string;
  defaultValue: string;
  onChangeText: (text: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  hint?: string;
  keyboardType?: 'numeric' | 'decimal-pad' | 'number-pad';
  maxLength?: number;
  editable?: boolean;
  inputKey?: string | number; // change this to reset the input
}

export const InputCard: React.FC<InputCardProps> = ({
  label,
  defaultValue,
  onChangeText,
  prefix = '₹',
  suffix,
  placeholder = '0',
  hint,
  keyboardType = 'numeric',
  maxLength = 12,
  editable = true,
  inputKey,
}) => {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(defaultValue);

  useEffect(() => {
    setText(defaultValue);
  }, [defaultValue, inputKey]);

  return (
    <View style={[styles.container, focused && styles.containerFocused]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={(next) => {
            setText(next);
            onChangeText(next);
          }}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          keyboardType={keyboardType}
          maxLength={maxLength}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={COLORS.accent}
          returnKeyType="done"
        />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <View style={[styles.underline, focused && styles.underlineFocused]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.md, padding: SPACING.base, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  containerFocused: { borderColor: COLORS.accent },
  label: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, fontWeight: TYPOGRAPHY.fontWeight.bold, marginBottom: SPACING.xs, textTransform: 'uppercase', letterSpacing: 0.8 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  prefix: { fontSize: TYPOGRAPHY.fontSize.xl, color: COLORS.accent, fontWeight: TYPOGRAPHY.fontWeight.bold, marginRight: SPACING.xs },
  input: { flex: 1, fontSize: TYPOGRAPHY.fontSize.xxl, color: COLORS.textPrimary, fontWeight: TYPOGRAPHY.fontWeight.bold, padding: 0, margin: 0 },
  suffix: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textSecondary, fontWeight: TYPOGRAPHY.fontWeight.semibold, marginLeft: SPACING.xs },
  hint: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textSecondary, marginTop: SPACING.xs, fontWeight: TYPOGRAPHY.fontWeight.semibold },
  underline: { height: 1, backgroundColor: COLORS.border, marginTop: SPACING.sm, borderRadius: RADIUS.full },
  underlineFocused: { backgroundColor: COLORS.accent, height: 2 },
});

export default InputCard;
