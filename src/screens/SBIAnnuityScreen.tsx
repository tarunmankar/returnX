import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Text } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { InputCard } from '../components/InputCard';
import { ResultCard } from '../components/ResultCard';
import { ErrorMessage, validateInputs } from '../components/ErrorMessage';
import { DonutChart } from '../components/DonutChart';
import { calcSBIAnnuity } from '../logic/sbiAnnuity';
import { useAppStore } from '../store/appStore';
import { parseInput, formatINR, formatINRShort } from '../utils/format';
import { shareToWhatsApp } from '../utils/share';
import { ResultActions } from '../components/ResultActions';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

export default function SBIAnnuityScreen() {
  const [principal, setPrincipal] = useState('1000000');
  const [rate, setRate] = useState('7.0');
  const [years, setYears] = useState('5');
  const [result, setResult] = useState<ReturnType<typeof calcSBIAnnuity> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { incrementCalcCount, saveCalculation } = useAppStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const principalRef = useRef(principal);
  const rateRef = useRef(rate);
  const yearsRef = useRef(years);
  principalRef.current = principal;
  rateRef.current = rate;
  yearsRef.current = years;

  const calculate = () => {
    const P = parseInput(principalRef.current);
    const R = parseInput(rateRef.current);
    const T = parseInput(yearsRef.current);
    
    const validation = validateInputs({
      principal: { value: P, label: 'Deposit Amount', min: 25000 },
      rate: { value: R, label: 'Interest Rate', min: 1, max: 15 },
      years: { value: T, label: 'Tenure', min: 3, max: 10 },
    });
    
    if (validation.valid && ![3, 5, 7, 10].includes(T)) {
      validation.valid = false;
      validation.errors.years = 'Tenure must be exactly 3, 5, 7, or 10 years.';
    }

    setErrors(validation.errors);
    if (!validation.valid) return;

    const res = calcSBIAnnuity(P, R, T);
    setResult(res);
  };

  const onPressCalculate = () => { calculate(); incrementCalcCount(); };

  const handleSave = () => {
    if (!result) return;
    saveCalculation({
      type: 'SBIAnnuity',
      label: `SBI Annuity: ${formatINRShort(parseInput(principalRef.current))}`,
      result: result.monthlyPayout,
      inputs: { principal: parseInput(principalRef.current), rate: parseInput(rateRef.current), years: parseInput(yearsRef.current) },
    });
  };

  const handleShare = () => {
    if (!result) return;
    shareToWhatsApp('SBI Annuity', [
      `Deposit Amount: ${formatINR(parseInput(principalRef.current))}`,
      `Interest Rate: ${rateRef.current}%`,
      `Tenure: ${yearsRef.current} Years`,
      `*Monthly Payout: ${formatINR(result.monthlyPayout)}*`,
      `*Total Money Back: ${formatINR(result.totalReturns)}*`
    ]);
  };

  const handleInput = (setter: (v: string) => void, ref: React.MutableRefObject<string>) => (text: string) => {
    ref.current = text;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => calculate(), 300);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="🛡️ SBI Annuity" subtitle="Fixed Monthly Payout Scheme" />

        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            Deposit a lump sum and receive fixed monthly payouts covering principal and interest!
          </Text>
        </View>

        <View style={styles.section}>
          <InputCard
            label="Deposit Amount"
            defaultValue={principal}
            onChangeText={handleInput(setPrincipal, principalRef)} 
            prefix="₹" 
            placeholder="10,00,000" 
            hint="Min ₹25,000" 
          />
          <ErrorMessage message={errors.principal || null} />
          <InputCard
            label="Interest Rate"
            defaultValue={rate}
            onChangeText={handleInput(setRate, rateRef)} 
            prefix="" 
            suffix="%" 
            placeholder="7.0" 
            hint="General: ~6.5-7.0% | Senior Citizen: ~7.0-7.5%" 
            keyboardType="decimal-pad"
          />
          <ErrorMessage message={errors.rate || null} />
          <InputCard
            label="Tenure (Years)"
            defaultValue={years}
            onChangeText={handleInput(setYears, yearsRef)} 
            prefix="" 
            suffix="Years" 
            placeholder="5" 
            hint="Only 3, 5, 7, or 10 years allowed" 
          />
          <ErrorMessage message={errors.years || null} />
          
          <View style={styles.presetRow}>
            <Text style={styles.presetLabel}>Tenure Presets:</Text>
            {[
              { label: '3 Yrs', value: '3' },
              { label: '5 Yrs', value: '5' },
              { label: '7 Yrs', value: '7' },
              { label: '10 Yrs', value: '10' }
            ].map((p) => (
              <TouchableOpacity key={p.value} style={styles.presetChip} onPress={() => { setYears(p.value); yearsRef.current = p.value; setTimeout(() => calculate(), 100); }}>
                <Text style={styles.presetChipText}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.calcBtn} onPress={onPressCalculate} activeOpacity={0.8}>
          <Text style={styles.calcBtnText}>Calculate Payout</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.section}>
            <ResultCard
              title="Annuity Breakdown"
              mainAmount={result.monthlyPayout}
              mainLabel="Your Monthly Payout"
              principalAmount={result.principal}
              interestAmount={result.totalInterest}
              rows={[
                { label: '💰 Total Money Back (Principal + Interest)', value: result.totalReturns, highlight: true, color: COLORS.accent },
              ]}
              disclaimer="TDS is applicable as per your tax slab. The principal is exhausted by the end of the tenure."
            />

            <DonutChart
              title="Deposit vs Interest"
              segments={[
                { value: result.principal, color: COLORS.primaryLight, label: 'Deposit' },
                { value: result.totalInterest, color: COLORS.accent, label: 'Interest Earned' },
              ]}
              centerLabel="Total Payouts"
              centerValue={result.totalReturns}
            />

            <ResultActions onSave={handleSave} onShare={handleShare} />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark },
  content: { paddingBottom: SPACING.xxxl },
  section: { padding: SPACING.base },
  infoBanner: { margin: SPACING.base, marginBottom: 0, backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  infoText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, textAlign: 'center' },
  presetRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, flexWrap: 'wrap', marginTop: SPACING.xs },
  presetLabel: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textMuted },
  presetChip: { backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.border },
  presetChipText: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.accent, fontWeight: TYPOGRAPHY.fontWeight.semibold },
  calcBtn: { backgroundColor: COLORS.accent, borderRadius: RADIUS.lg, marginHorizontal: SPACING.base, paddingVertical: SPACING.base, alignItems: 'center', shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  calcBtnText: { color: COLORS.primary, fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, letterSpacing: 0.5 },
});
