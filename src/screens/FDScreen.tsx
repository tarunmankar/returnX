/**
 * ReturnX - FD Calculator Screen
 * Fixed Deposit — Indian banks ke liye
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
import { ErrorMessage, RateQuickSelect, validateInputs, Toast } from '../components/ErrorMessage';
import { OptionChips } from '../components/OptionChips';
import { calcFD, calcFDYearWise, POPULAR_FD_RATES } from '../logic/fd';
import { useAppStore } from '../store/appStore';
import { parseInput, formatINR, formatINRShort } from '../utils/format';
import { shareToWhatsApp } from '../utils/share';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

export default function FDScreen() {
  const [amount, setAmount] = useState('100000');
  const [rate, setRate] = useState('7.0');
  const [months, setMonths] = useState('12');
  const [taxRate, setTaxRate] = useState<'0' | '5' | '20' | '30'>('20');
  const [seniorCitizen, setSeniorCitizen] = useState<'No' | 'Yes'>('No');
  const [result, setResult] = useState<ReturnType<typeof calcFD> | null>(null);
  const [yearWise, setYearWise] = useState<ReturnType<typeof calcFDYearWise>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const { addHistory, incrementCalcCount, saveCalculation } = useAppStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const amountRef = useRef(amount);
  const rateRef = useRef(rate);
  const monthsRef = useRef(months);

  const calculate = () => {
    const P = parseInput(amountRef.current);
    const R = parseInput(rateRef.current);
    const M = parseInput(monthsRef.current);

    const validation = validateInputs({
      amount: { value: P, label: 'Deposit Amount', min: 1000 },
      months: { value: M, label: 'Tenure', min: 1, max: 360 },
    });

    setErrors(validation.errors);
    if (!validation.valid) return;

    const res = calcFD(P, R, M, true, {
      taxRate: parseInput(taxRate),
      seniorCitizen: seniorCitizen === 'Yes',
    });
    setResult(res);
    setYearWise(calcFDYearWise(P, R, M));

    if (res.tdsApplicable) {
      setToastMsg(`⚠️ TDS applicable: Interest > ${formatINR(res.tdsThreshold)}`);
      setShowToast(true);
    }
  };

  const onPressCalculate = () => { calculate(); incrementCalcCount(); };

  const handleSave = () => {
    if (!result) return;
    saveCalculation({
      type: 'FD',
      label: `FD ${formatINRShort(parseInput(amountRef.current))} for ${monthsRef.current}M`,
      result: result.maturityAmount,
      inputs: { amount: parseInput(amountRef.current), rate: parseInput(rateRef.current), months: parseInput(monthsRef.current) },
    });
  };

  const handleShare = () => {
    if (!result) return;
    shareToWhatsApp('FD Calculation', [
      `Deposit Amount: ${formatINR(parseInput(amountRef.current))}`,
      `Interest Rate: ${rateRef.current}%`,
      `Tenure: ${monthsRef.current} Months`,
      `*Interest Earned: ${formatINR(result.totalInterest)}*`,
      `*Maturity Amount: ${formatINR(result.maturityAmount)}*`
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

        {/* Header */}
        <ScreenHeader title="🏦 FD Calculator" subtitle="Fixed Deposit — Surakshit Bachat" />

        {/* Indian Tip Banner */}
        <View style={styles.tipBanner}>
          <Text style={styles.tipText}>
            💡 <Text style={styles.tipBold}>Pro Tip:</Text> Senior Citizens ko 0.25-0.5% extra rate milti hai!
          </Text>
        </View>

        <View style={styles.section}>
          {/* Quick Rate Select */}
          <RateQuickSelect
            title="Quick Bank Rates"
            rates={POPULAR_FD_RATES}
            onSelect={(r) => { setRate(String(r)); setTimeout(() => calculate(), 100); }}
          />
          <OptionChips
            label="Tax Slab Estimate"
            options={[
              { label: '0%', value: '0' },
              { label: '5%', value: '5' },
              { label: '20%', value: '20' },
              { label: '30%', value: '30' },
            ]}
            value={taxRate}
            onChange={(value) => { setTaxRate(value); setTimeout(() => calculate(), 100); }}
          />
          <OptionChips
            label="Senior Citizen"
            options={[
              { label: 'No', value: 'No' },
              { label: 'Yes', value: 'Yes' },
            ]}
            value={seniorCitizen}
            onChange={(value) => { setSeniorCitizen(value); setTimeout(() => calculate(), 100); }}
            accentColor={COLORS.warning}
          />
          <InputCard
            label="Investment Amount"
            defaultValue={amount}
            onChangeText={handleInput(setAmount, amountRef)} prefix="₹" placeholder="1,00,000" hint="Enter the amount for FD" />
          <ErrorMessage message={errors.amount || null} />
          <InputCard
            label="Interest Rate"
            defaultValue={rate}
            onChangeText={handleInput(setRate, rateRef)} prefix="" suffix="% p.a." placeholder="7.0" keyboardType="decimal-pad" hint="Bank se check karein ya oopar se select karein" />
          <InputCard
            label="Duration (Months)"
            defaultValue={months}
            onChangeText={handleInput(setMonths, monthsRef)} prefix="" suffix="Months" placeholder="12" hint="1 years = 12 mahine | 5 years = 60 mahine" />
          <ErrorMessage message={errors.months || null} />
        </View>

        <TouchableOpacity style={styles.calcBtn} onPress={onPressCalculate} activeOpacity={0.8}>
          <Text style={styles.calcBtnText}>Maturity Dekhein 🏦</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.section}>
            <ResultCard
              title="FD Pakne Par Milega"
              mainAmount={result.maturityAmount}
              mainLabel="Maturity Amount"
              principalAmount={result.principal}
              interestAmount={result.totalInterest}
              rows={[
                { label: 'Interest Earned', value: result.totalInterest, highlight: true, color: COLORS.accent },
                { label: 'Estimated Tax', value: result.estimatedTax, color: COLORS.warning },
                { label: 'Post-Tax Maturity', value: result.postTaxMaturity, color: COLORS.accent },
                ...(result.tdsApplicable ? [
                  { label: '⚠️ TDS Katega (10%)', value: result.tdsAmount, color: COLORS.warning },
                  { label: 'TDS Trigger Limit', value: result.tdsThreshold, color: COLORS.textSecondary },
                ] : []),
              ]}
              disclaimer="Tax estimate selected slab par based hai. Actual FD tax, TDS credit, aur exemptions alag ho sakte hain. Financial advice nahi."
            />

            {/* Donut Chart */}
            <DonutChart
              title="Investment vs Earnings"
              segments={[
                { value: result.principal, color: COLORS.primaryLight, label: 'Your Money' },
                { value: result.totalInterest, color: COLORS.accent, label: 'Byaj (Earnings) 🎁' },
              ]}
              centerLabel="Kul"
              centerValue={result.maturityAmount}
            />

            <ResultActions onSave={handleSave} onShare={handleShare} />

            {/* Bar Chart */}
            {yearWise.length > 1 && (
              <BarChart
                title="Year-by-Year Growth 📈"
                data={yearWise.map(y => ({
                  label: `Y${y.year}`,
                  value1: result.principal,
                  value2: y.interest,
                  value1Label: 'Your Money',
                  value2Label: 'Byaj',
                }))}
                color1={COLORS.primaryLight}
                color2={COLORS.accent}
              />
            )}

            {/* TDS Warning */}
            {result.tdsApplicable && (
              <View style={styles.tdsWarning}>
                <Text style={styles.tdsIcon}>⚠️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tdsTitle}>TDS Notice</Text>
                  <Text style={styles.tdsText}>
                    Aapki byaj {formatINR(result.totalInterest)} hai jo {formatINR(result.tdsThreshold)} se zyada hai. Bank {formatINR(result.tdsAmount)} TDS (10%) katega. Form 15G/15H bharke TDS credit claim kiya ja sakta hai.
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        <AdBannerPlaceholder size="banner" />

        {/* Toast */}
        <Toast message={toastMsg} type="info" visible={showToast} onHide={() => setShowToast(false)} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark },
  content: { paddingBottom: SPACING.xxxl },
  tipBanner: { margin: SPACING.base, marginBottom: 0, backgroundColor: 'rgba(0,200,83,0.08)', borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.accent + '33' },
  tipText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, lineHeight: 18 },
  tipBold: { fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.accent },
  section: { padding: SPACING.base },
  calcBtn: { backgroundColor: COLORS.accent, borderRadius: RADIUS.lg, marginHorizontal: SPACING.base, paddingVertical: SPACING.base, alignItems: 'center', shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  calcBtnText: { color: COLORS.primary, fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, letterSpacing: 0.5 },
  tdsWarning: { backgroundColor: 'rgba(255,214,0,0.08)', borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.warning + '55', flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  tdsIcon: { fontSize: 20 },
  tdsTitle: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.warning, marginBottom: 4 },
  tdsText: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textSecondary, lineHeight: 18 },
});
