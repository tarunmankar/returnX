/**
 * ReturnX - PPF Calculator Screen
 * Public Provident Fund — Sarkar Ki Guarantee, Tax Free!
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
import { AdBannerPlaceholder } from '../components/AdBannerPlaceholder';
import { BarChart } from '../components/BarChart';
import { DonutChart } from '../components/DonutChart';
import { ErrorMessage, validateInputs } from '../components/ErrorMessage';
import { calcPPF, calcPPFYearWise, PPF_CURRENT_RATE, PPF_MAX_ANNUAL, PPF_MIN_TENURE } from '../logic/ppf';
import { useAppStore } from '../store/appStore';
import { parseInput, formatINR, formatINRShort } from '../utils/format';
import { shareToWhatsApp } from '../utils/share';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';
import { RateBanner } from '../components/RateBanner';
import { GOVT_RATE_REVIEWED_ON, GOVT_RATE_SOURCE, GOVT_RATE_WARNING } from '../constants/compliance';

export default function PPFScreen() {
  const [annual, setAnnual] = useState('150000');
  const [rate, setRate] = useState(String(PPF_CURRENT_RATE));
  const [years, setYears] = useState(String(PPF_MIN_TENURE));
  const [result, setResult] = useState<ReturnType<typeof calcPPF> | null>(null);
  const [yearWise, setYearWise] = useState<ReturnType<typeof calcPPFYearWise>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTable, setShowTable] = useState(false);
  const { addHistory, incrementCalcCount, saveCalculation } = useAppStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const annualRef = useRef(annual);
  const rateRef = useRef(rate);
  const yearsRef = useRef(years);


  const calculate = () => {
    const P = parseInput(annualRef.current);
    const R = parseInput(rateRef.current);
    const T = parseInput(yearsRef.current);

    const validation = validateInputs({
      annual: { value: P, label: 'Annual Amount', min: 500, max: PPF_MAX_ANNUAL },
      years: { value: T, label: 'Duration', min: PPF_MIN_TENURE, max: 50 },
    });

    setErrors(validation.errors);
    if (!validation.valid) return;

    const res = calcPPF(P, R, T);
    setResult(res);
    setYearWise(calcPPFYearWise(P, R, T));
  };

  const onPressCalculate = () => { calculate(); incrementCalcCount(); };

  const handleSave = () => {
    if (!result) return;
    saveCalculation({
      type: 'PPF',
      label: `PPF ${formatINRShort(parseInput(annualRef.current))}/yr for ${yearsRef.current}Y`,
      result: result.maturityAmount,
      inputs: { amount: parseInput(annualRef.current), rate: parseInput(rateRef.current), years: parseInput(yearsRef.current) },
    });
  };

  const handleShare = () => {
    if (!result) return;
    shareToWhatsApp('PPF Calculation', [
      `Annual Deposit: ${formatINR(parseInput(annualRef.current))}`,
      `Interest Rate: ${rateRef.current}%`,
      `Tenure: ${yearsRef.current} Years`,
      `*Total Interest: ${formatINR(result.totalInterest)}*`,
      `*Maturity Value: ${formatINR(result.maturityAmount)}*`
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

        <ScreenHeader title="🏛️ PPF Calculator" subtitle="Public Provident Fund — Triple Tax-Free!" />

        {/* PPF Benefits Banner */}
        <View style={styles.benefitsBanner}>
          <Text style={styles.benefitsTitle}>🌟 PPF Benefits</Text>
          <View style={styles.benefitsRow}>
            {[
              { icon: '🏛️', text: 'Govt Guarantee' },
              { icon: '🆓', text: '80C Tax Saving' },
              { icon: '💚', text: 'Tax-Free Interest' },
              { icon: '✅', text: 'Tax-Free Maturity' },
            ].map((b, i) => (
              <View key={i} style={styles.benefitChip}>
                <Text style={styles.benefitIcon}>{b.icon}</Text>
                <Text style={styles.benefitText}>{b.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Compact top banner with inline editable rate */}
        <RateBanner
          defaultRate={rate}
          onRateChange={handleInput(setRate, rateRef)}
          details={`EEE tax treatment under current rules | Max ₹1.5L/yr\nMin Tenure: ${PPF_MIN_TENURE} Years | Sovereign-backed account`}
          accentColor={COLORS.accent}
          sourceLabel={GOVT_RATE_SOURCE}
          reviewedOn={GOVT_RATE_REVIEWED_ON}
          warningText={GOVT_RATE_WARNING}
        />
        <TouchableOpacity
          style={styles.resetRateBtn}
          onPress={() => { setRate(String(PPF_CURRENT_RATE)); rateRef.current = String(PPF_CURRENT_RATE); setTimeout(() => calculate(), 100); }}
        >
          <Text style={styles.resetRateText}>↩ Reset to current rate ({PPF_CURRENT_RATE}%)</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <InputCard
            label="Annual Investment Amount"
            defaultValue={annual}
            onChangeText={handleInput(setAnnual, annualRef)}
            prefix="₹"
            placeholder="1,50,000"
            hint={`Maximum ₹1,50,000 per year allowed | Min ₹500`}
          />
          <ErrorMessage message={errors.annual || null} />
          <InputCard
            label="Tenure (Years)"
            defaultValue={years}
            onChangeText={handleInput(setYears, yearsRef)}
            prefix=""
            suffix="Years"
            placeholder="15"
            hint="Minimum 15 years. Extendable in blocks of 5."
          />
          <ErrorMessage message={errors.years || null} />
        </View>

        <TouchableOpacity style={styles.calcBtn} onPress={onPressCalculate} activeOpacity={0.8}>
          <Text style={styles.calcBtnText}>Calculate Maturity 🏛️</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.section}>
            <ResultCard
              title="PPF Maturity Value"
              mainAmount={result.maturityAmount}
              mainLabel="Tax-Free Maturity Amount"
              accentColor={COLORS.accent}
              principalAmount={result.totalInvested}
              interestAmount={result.totalInterest}
              rows={[
                { label: 'Interest Earned (Tax-Free!) 🎉', value: result.totalInterest, highlight: true, color: COLORS.accent },
                { label: '80C Tax Saved*', value: result.taxSaved, color: COLORS.warning },
              ]}
              disclaimer="*Tax-saving estimate assumes a 30% slab. Reference rate only; verify the latest govt notification and current tax rules before investing. Not financial advice."
            />

            {/* EEE Badge */}
            <View style={styles.eeeBadge}>
              <Text style={styles.eeeTitle}>🏆 EEE Status — Triple Tax Exempt</Text>
              <Text style={styles.eeeText}>
                Invest → <Text style={{ color: COLORS.accent }}>Tax-Free</Text> |
                Returns → <Text style={{ color: COLORS.accent }}>Tax-Free</Text> |
                Maturity → <Text style={{ color: COLORS.accent }}>Tax-Free</Text>
              </Text>
            </View>

            <DonutChart
              title="Investment vs Interest"
              segments={[
                { value: result.totalInvested, color: COLORS.primaryLight, label: 'Your Money' },
                { value: result.totalInterest, color: COLORS.accent, label: 'Tax-Free Interest 💚' },
              ]}
              centerLabel="Maturity"
              centerValue={result.maturityAmount}
            />

            <ResultActions onSave={handleSave} onShare={handleShare} />

            {/* Yearly table toggle */}
            <TouchableOpacity style={styles.tableToggle} onPress={() => setShowTable(!showTable)}>
              <Text style={styles.tableToggleText}>{showTable ? '▲' : '▼'} Year-by-Year Breakdown</Text>
            </TouchableOpacity>

            {showTable && (
              <View style={styles.tableCard}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { flex: 0.5 }]}>Years</Text>
                  <Text style={styles.tableHeaderText}>Deposit</Text>
                  <Text style={styles.tableHeaderText}>Interest</Text>
                  <Text style={styles.tableHeaderText}>Total</Text>
                </View>
                {yearWise.map((row) => (
                  <View key={row.year} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 0.5, color: COLORS.textSecondary }]}>{row.year}</Text>
                    <Text style={[styles.tableCell]}>{formatINR(row.cumulativeInvested)}</Text>
                    <Text style={[styles.tableCell, { color: COLORS.accent }]}>{formatINR(row.interest)}</Text>
                    <Text style={[styles.tableCell, { color: COLORS.accent, fontWeight: TYPOGRAPHY.fontWeight.bold }]}>{formatINR(row.closingBalance)}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <AdBannerPlaceholder size="banner" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark },
  content: { paddingBottom: SPACING.xxxl },
  screenSubtitle: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.accent },
  benefitsBanner: { margin: SPACING.base, marginBottom: 0, backgroundColor: 'rgba(0,200,83,0.06)', borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.accent + '33' },
  benefitsTitle: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.accent, marginBottom: SPACING.sm },
  benefitsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  benefitChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.border },
  benefitIcon: { fontSize: 12 },
  benefitText: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textSecondary },
  section: { padding: SPACING.base },
  rateCurrentChip: { backgroundColor: 'rgba(0,200,83,0.1)', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.accent + '44' },
  rateCurrentText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
  rateCurrentValue: { color: COLORS.accent, fontWeight: TYPOGRAPHY.fontWeight.bold },
  resetRateBtn: { marginHorizontal: SPACING.base, marginTop: 4, alignSelf: 'flex-start' },
  resetRateText: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.accent, textDecorationLine: 'underline' },
  calcBtn: { backgroundColor: COLORS.accent, borderRadius: RADIUS.lg, marginHorizontal: SPACING.base, paddingVertical: SPACING.base, alignItems: 'center', shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  calcBtnText: { color: COLORS.primary, fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, letterSpacing: 0.5 },
  eeeBadge: { backgroundColor: 'rgba(0,200,83,0.08)', borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.accent + '44', marginTop: SPACING.sm, alignItems: 'center' },
  eeeTitle: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  eeeText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
  tableToggle: { backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', marginTop: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  tableToggleText: { color: COLORS.accent, fontWeight: TYPOGRAPHY.fontWeight.semibold, fontSize: TYPOGRAPHY.fontSize.sm },
  tableCard: { backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.xl, overflow: 'hidden', marginTop: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  tableHeader: { flexDirection: 'row', backgroundColor: COLORS.primary, padding: SPACING.sm },
  tableHeaderText: { flex: 1, color: COLORS.textSecondary, fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: TYPOGRAPHY.fontWeight.bold, textAlign: 'center' },
  tableRow: { flexDirection: 'row', padding: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  tableCell: { flex: 1, fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textPrimary, textAlign: 'center' },
});
