/**
 * ReturnX - SIP Calculator Screen (v2 - with Charts + Validation)
 */

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { ScreenHeader } from '../components/ScreenHeader';
import { InputCard } from '../components/InputCard';
import { ResultCard } from '../components/ResultCard';
import { ResultActions } from '../components/ResultActions';
import { RiskBadge } from '../components/RiskBadge';
import { AdBannerPlaceholder } from '../components/AdBannerPlaceholder';
import { BarChart } from '../components/BarChart';
import { DonutChart } from '../components/DonutChart';
import { ErrorMessage, validateInputs } from '../components/ErrorMessage';
import { calcSIP, calcSIPYearWise } from '../logic/sip';
import { useAppStore } from '../store/appStore';
import { parseInput, formatINR, formatINRShort } from '../utils/format';
import { shareToWhatsApp } from '../utils/share';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

export default function SIPScreen() {
  const [monthly, setMonthly] = useState('10000');
  const [rate, setRate] = useState('12');
  const [years, setYears] = useState('10');
  const [result, setResult] = useState<ReturnType<typeof calcSIP> | null>(null);
  const [yearWise, setYearWise] = useState<ReturnType<typeof calcSIPYearWise>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { addHistory, incrementCalcCount, saveCalculation } = useAppStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const monthlyRef = useRef(monthly);
  const rateRef = useRef(rate);
  const yearsRef = useRef(years);

  const calculate = () => {
    const P = parseInput(monthlyRef.current);
    const R = parseInput(rateRef.current);
    const T = parseInput(yearsRef.current);

    const validation = validateInputs({
      monthly: { value: P, label: 'Monthly Amount', min: 100 },
      years: { value: T, label: 'Duration', min: 1, max: 50 },
    });
    setErrors(validation.errors);
    if (!validation.valid) return;

    const res = calcSIP(P, R, T);
    setResult(res);
    setYearWise(calcSIPYearWise(P, R, T));
  };

  const onPressCalculate = () => { calculate(); incrementCalcCount(); };

  const handleSave = () => {
    if (!result) return;
    saveCalculation({
      type: 'SIP',
      label: `SIP ${formatINRShort(parseInput(monthlyRef.current))}/mo for ${yearsRef.current}Y`,
      result: result.futureValue,
      inputs: { amount: parseInput(monthlyRef.current), rate: parseInput(rateRef.current), years: parseInput(yearsRef.current) },
    });
  };

  const handleShare = () => {
    if (!result) return;
    shareToWhatsApp('SIP Calculation', [
      `Monthly SIP: ${formatINR(parseInput(monthlyRef.current))}`,
      `Expected Rate: ${rateRef.current}%`,
      `Duration: ${yearsRef.current} Years`,
      `*Total Invested: ${formatINR(result.totalInvested)}*`,
      `*Expected Returns: ${formatINR(result.totalReturns)}*`,
      `*Final Value: ${formatINR(result.futureValue)}*`
    ]);
  };

  const handleInput = (setter: (v: string) => void, ref: React.MutableRefObject<string>) => (text: string) => {
    ref.current = text;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setter(text);
      calculate();
    }, 300);
  };

  const R = parseInput(rate);

  return (
    <View style={styles.container}>
      <ScreenHeader title="📈 SIP Calculator" subtitle="Systematic Investment Plan" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Tip */}
        <View style={styles.tipBanner}>
          <Text style={styles.tipText}>
            💡 <Text style={styles.tipBold}>Pro Tip:</Text> ₹10,000/month @ 12% for 10 years can grow to ~₹23 Lakh!
          </Text>
        </View>

        <View style={styles.section}>
          <InputCard
            label="Monthly Investment"
            defaultValue={monthly}
            onChangeText={handleInput(setMonthly, monthlyRef)} prefix="₹" placeholder="10,000" hint="Start with at least ₹500" />
          <ErrorMessage message={errors.monthly || null} />
          <InputCard
            label="Interest Rate"
            defaultValue={rate}
            onChangeText={handleInput(setRate, rateRef)} prefix="" suffix="% p.a." placeholder="12" keyboardType="decimal-pad" hint="NIFTY 50 historical average: 12-15% | Debt funds: 6-8%" />
          <InputCard
            label="Tenure (Years)"
            defaultValue={years}
            onChangeText={handleInput(setYears, yearsRef)} prefix="" suffix="Years" placeholder="10" hint="Longer tenure means more compounding 🚀" />
          <ErrorMessage message={errors.years || null} />

          {R > 0 && <RiskBadge rate={R} showDescription />}

          {/* Quick presets */}
          <View style={styles.presetRow}>
            <Text style={styles.presetLabel}>Quick Fills:</Text>
            {[{ label: '5 Years', years: '5' }, { label: '10 Years', years: '10' }, { label: '20 Years', years: '20' }, { label: '30 Years', years: '30' }].map((p) => (
              <TouchableOpacity key={p.years} style={styles.presetChip} onPress={() => { setYears(p.years); yearsRef.current = p.years; setTimeout(() => calculate(), 100); }}>
                <Text style={styles.presetChipText}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.calcBtn} onPress={onPressCalculate} activeOpacity={0.8}>
          <Text style={styles.calcBtnText}>Calculate Returns 🚀</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.section}>
            <ResultCard
              title="SIP Returns Summary"
              mainAmount={result.futureValue}
              mainLabel="Future Value"
              principalAmount={result.totalInvested}
              interestAmount={result.totalReturns}
              rows={[
                { label: 'Returns 🎉', value: result.totalReturns, highlight: true, color: COLORS.accent },
                { label: 'Wealth Multiplier', value: result.wealthRatio, isPercent: false, suffix: 'x', color: COLORS.accentLight },
              ]}
              disclaimer="This is an estimate. Actual market returns may vary. Not financial advice."
            />

            {/* Donut Chart */}
            <DonutChart
              title="Your Investment vs Returns"
              segments={[
                { value: result.totalInvested, color: COLORS.primaryLight, label: 'Invested' },
                { value: result.totalReturns, color: COLORS.accent, label: 'Market Returns 🎁' },
              ]}
              centerLabel="Total Value"
              centerValue={result.futureValue}
            />

            <ResultActions onSave={handleSave} onShare={handleShare} />

            {/* Bar Chart */}
            {yearWise.length > 1 && (
              <BarChart
                title="Year-by-Year Growth 📊"
                data={yearWise.map(y => ({
                  label: `Y${y.year}`,
                  value1: y.invested,
                  value2: y.returns,
                  value1Label: 'Deposited',
                  value2Label: 'Returns',
                }))}
                color1={COLORS.primaryLight}
                color2={COLORS.accent}
              />
            )}
          </View>
        )}

        <AdBannerPlaceholder size="banner" />
      </ScrollView>
    </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark },
  content: { paddingBottom: SPACING.xxxl },
  tipBanner: { margin: SPACING.base, marginBottom: 0, backgroundColor: 'rgba(0,200,83,0.08)', borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.accent + '33' },
  tipText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, lineHeight: 18 },
  tipBold: { fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.accent },
  section: { padding: SPACING.base },
  presetRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, flexWrap: 'wrap', marginTop: SPACING.xs },
  presetLabel: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textMuted },
  presetChip: { backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.border },
  presetChipText: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.accent, fontWeight: TYPOGRAPHY.fontWeight.semibold },
  calcBtn: { backgroundColor: COLORS.accent, borderRadius: RADIUS.lg, marginHorizontal: SPACING.base, paddingVertical: SPACING.base, alignItems: 'center', shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  calcBtnText: { color: COLORS.primary, fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, letterSpacing: 0.5 },
});
