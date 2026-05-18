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
import { OptionChips } from '../components/OptionChips';
import { calcInflationAdjustedValue, calcRequiredSIPForGoal, calcSIP, calcSIPYearWise } from '../logic/sip';
import { useAppStore } from '../store/appStore';
import { parseInput, formatINR, formatINRShort } from '../utils/format';
import { shareToWhatsApp } from '../utils/share';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';
import { MARKET_RETURN_WARNING } from '../constants/compliance';

export default function SIPScreen() {
  const [monthly, setMonthly] = useState('10000');
  const [rate, setRate] = useState('12');
  const [years, setYears] = useState('10');
  const [stepUp, setStepUp] = useState('0');
  const [goalAmount, setGoalAmount] = useState('');
  const [inflationRate, setInflationRate] = useState('6');
  const [result, setResult] = useState<ReturnType<typeof calcSIP> | null>(null);
  const [yearWise, setYearWise] = useState<ReturnType<typeof calcSIPYearWise>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { addHistory, incrementCalcCount, saveCalculation } = useAppStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const monthlyRef = useRef(monthly);
  const rateRef = useRef(rate);
  const yearsRef = useRef(years);
  const stepUpRef = useRef(stepUp);
  const goalRef = useRef(goalAmount);
  const inflationRef = useRef(inflationRate);

  const calculate = () => {
    const P = parseInput(monthlyRef.current);
    const R = parseInput(rateRef.current);
    const T = parseInput(yearsRef.current);
    const annualStepUp = parseInput(stepUpRef.current);
    const inflation = parseInput(inflationRef.current);

    const validation = validateInputs({
      monthly: { value: P, label: 'Monthly Amount', min: 100 },
      years: { value: T, label: 'Duration', min: 1, max: 50 },
      stepUp: { value: annualStepUp + 1, label: 'Step-Up', min: 1, max: 26 },
      inflation: { value: inflation + 1, label: 'Inflation', min: 1, max: 16 },
    });
    setErrors(validation.errors);
    if (!validation.valid) return;

    const res = calcSIP(P, R, T, annualStepUp);
    setResult(res);
    setYearWise(calcSIPYearWise(P, R, T, annualStepUp));
  };

  const onPressCalculate = () => { calculate(); incrementCalcCount(); };

  const handleSave = () => {
    if (!result) return;
    saveCalculation({
      type: 'SIP',
      label: `SIP ${formatINRShort(parseInput(monthlyRef.current))}/mo for ${yearsRef.current}Y`,
      result: result.futureValue,
      inputs: {
        amount: parseInput(monthlyRef.current),
        rate: parseInput(rateRef.current),
        years: parseInput(yearsRef.current),
        stepUp: parseInput(stepUpRef.current),
      },
    });
  };

  const handleShare = () => {
    if (!result) return;
    shareToWhatsApp('SIP Calculation', [
      `Monthly SIP: ${formatINR(parseInput(monthlyRef.current))}`,
      `Expected Rate: ${rateRef.current}%`,
      `Duration: ${yearsRef.current} Years`,
      `Step-Up: ${stepUpRef.current || '0'}% / year`,
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
  const currentStepUp = parseInput(stepUp);
  const currentInflation = parseInput(inflationRate);
  const currentGoal = parseInput(goalAmount);
  const inflationAdjustedValue = result
    ? calcInflationAdjustedValue(result.futureValue, currentInflation, parseInput(yearsRef.current))
    : 0;
  const requiredSip = currentGoal > 0
    ? calcRequiredSIPForGoal(currentGoal, parseInput(rateRef.current), parseInput(yearsRef.current), currentStepUp)
    : 0;

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
          <InputCard
            label="Step-Up Every Year"
            defaultValue={stepUp}
            onChangeText={handleInput(setStepUp, stepUpRef)} prefix="" suffix="%"
            placeholder="0" keyboardType="decimal-pad" hint="Salary badhne par SIP ko yearly increase karein" />
          <InputCard
            label="Goal Corpus (Optional)"
            defaultValue={goalAmount}
            onChangeText={handleInput(setGoalAmount, goalRef)} prefix="₹"
            placeholder="50,00,000" hint="Target amount dalo to required SIP niklega" />
          <InputCard
            label="Inflation Rate"
            defaultValue={inflationRate}
            onChangeText={handleInput(setInflationRate, inflationRef)} prefix="" suffix="%"
            placeholder="6" keyboardType="decimal-pad" hint="Real buying power dekhne ke liye use hota hai" />
          <ErrorMessage message={errors.years || null} />

          {R > 0 && <RiskBadge rate={R} showDescription />}
          <ErrorMessage message={errors.stepUp || errors.inflation || null} />

          <OptionChips
            label="Popular Step-Up"
            options={[
              { label: '0%', value: '0' },
              { label: '5%', value: '5' },
              { label: '10%', value: '10' },
            ]}
            value={stepUp}
            onChange={(value) => {
              setStepUp(value);
              stepUpRef.current = value;
              setTimeout(() => calculate(), 100);
            }}
          />

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
                ...(currentStepUp > 0 ? [{ label: 'Annual Step-Up', value: currentStepUp, isPercent: false, suffix: '%' }] : []),
                { label: 'Inflation-Adjusted Value', value: inflationAdjustedValue, color: COLORS.warning },
                { label: 'Wealth Multiplier', value: result.wealthRatio, isPercent: false, suffix: 'x', color: COLORS.accentLight },
              ]}
              disclaimer={MARKET_RETURN_WARNING}
            />

            {currentGoal > 0 && (
              <ResultCard
                title="Goal Planning"
                mainAmount={requiredSip}
                mainLabel="Required Monthly SIP"
                accentColor={COLORS.warning}
                rows={[
                  { label: 'Target Corpus', value: currentGoal },
                  { label: 'Current Projection', value: result.futureValue, color: COLORS.accent },
                  { label: 'Gap / Surplus', value: result.futureValue - currentGoal, color: result.futureValue >= currentGoal ? COLORS.accent : COLORS.risk },
                ]}
                disclaimer="Required SIP assumes the same return and step-up settings. Actual market returns may vary."
              />
            )}

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
