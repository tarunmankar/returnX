import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Text } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { InputCard } from '../components/InputCard';
import { ResultCard } from '../components/ResultCard';
import { RateBanner } from '../components/RateBanner';
import { ErrorMessage, validateInputs } from '../components/ErrorMessage';
import { DonutChart } from '../components/DonutChart';
import { BarChart } from '../components/BarChart';
import { calcSSY } from '../logic/ssy';
import { useAppStore } from '../store/appStore';
import { parseInput } from '../utils/format';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

export default function SSYScreen() {
  const [yearlyDeposit, setYearlyDeposit] = useState('100000');
  const [rate, setRate] = useState('8.2');
  const [result, setResult] = useState<ReturnType<typeof calcSSY> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { addHistory, incrementCalcCount } = useAppStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const yearlyRef = useRef(yearlyDeposit);
  const rateRef = useRef(rate);
  yearlyRef.current = yearlyDeposit;
  rateRef.current = rate;

  const calculate = () => {
    const P = parseInput(yearlyRef.current);
    const R = parseInput(rateRef.current);
    const validation = validateInputs({
      yearlyDeposit: { value: P, label: 'Annual Deposit Amount', min: 250, max: 150000 },
      rate: { value: R, label: 'Interest Rate', min: 1, max: 15 },
    });
    setErrors(validation.errors);
    if (!validation.valid) return;
    const res = calcSSY(P, R);
    setResult(res);
  };

  const onPressCalculate = () => { calculate(); incrementCalcCount(); };

  const handleInput = (setter: (v: string) => void, ref: React.MutableRefObject<string>) => (text: string) => {
    ref.current = text;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => calculate(), 300);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="👧 SSY Calculator" subtitle="Sukanya Samriddhi Yojana" />

        {/* Compact top banner with inline editable rate */}
        <RateBanner
          defaultRate={rate}
          onRateChange={handleInput(setRate, rateRef)}
          details={"Deposit 15 years | Matures at 21 years\nTax Free (EEE) | Govt. Guaranteed"}
          accentColor={'#E91E63'}
        />
        {errors.rate ? <Text style={styles.rateError}>{errors.rate}</Text> : null}

        <View style={styles.section}>
          <InputCard
            label="Yearly Investment"
            defaultValue={yearlyDeposit}
            onChangeText={handleInput(setYearlyDeposit, yearlyRef)}
            prefix="₹"
            placeholder="1,00,000"
            hint="Min ₹250 | Max ₹1,50,000 per year"
          />
          <ErrorMessage message={errors.yearlyDeposit || null} />

          <View style={styles.presetRow}>
            <Text style={styles.presetLabel}>Quick Fills:</Text>
            {[
              { label: '₹12K/yr', value: '12000' },
              { label: '₹50K/yr', value: '50000' },
              { label: '₹1.5L (Max)', value: '150000' }
            ].map((p) => (
              <TouchableOpacity key={p.value} style={styles.presetChip} onPress={() => { setYearlyDeposit(p.value); yearlyRef.current = p.value; setTimeout(() => calculate(), 100); }}>
                <Text style={styles.presetChipText}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.calcBtn} onPress={onPressCalculate} activeOpacity={0.8}>
          <Text style={styles.calcBtnText}>Calculate Return</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.section}>
            <ResultCard
              title="SSY Maturity"
              mainAmount={result.maturityAmount}
              mainLabel="Value at 21 Years"
              accentColor={'#E91E63'}
              rows={[
                { label: 'Total Deposited (15 Yrs)', value: result.totalDeposited },
                { label: 'Total Interest Earned', value: result.totalInterest, highlight: true, color: '#E91E63' },
              ]}
              disclaimer="Completely Tax Free (EEE Status) under Section 80C."
            />
            <DonutChart
              title="Investment vs Interest"
              segments={[
                { value: result.totalDeposited, color: COLORS.primaryLight, label: 'Invested' },
                { value: result.totalInterest, color: '#E91E63', label: 'Interest Earned' },
              ]}
              centerLabel="Maturity Value"
              centerValue={result.maturityAmount}
            />
            <BarChart
              title="Year-by-Year Growth 📊"
              data={result.yearlyData.map(y => ({
                label: `Y${y.year}`,
                value1: y.deposit,
                value2: y.interest,
                value1Label: 'Deposit',
                value2Label: 'Interest',
              }))}
              color1={COLORS.primaryLight}
              color2={'#E91E63'}
            />
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
  rateError: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.risk, marginHorizontal: SPACING.base, marginTop: 4 },
  presetRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, flexWrap: 'wrap', marginTop: SPACING.xs },
  presetLabel: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textMuted },
  presetChip: { backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.border },
  presetChipText: { fontSize: TYPOGRAPHY.fontSize.xs, color: '#E91E63', fontWeight: TYPOGRAPHY.fontWeight.semibold },
  calcBtn: { backgroundColor: '#E91E63', borderRadius: RADIUS.lg, marginHorizontal: SPACING.base, paddingVertical: SPACING.base, alignItems: 'center', shadowColor: '#E91E63', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  calcBtnText: { color: COLORS.white, fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, letterSpacing: 0.5 },
});
