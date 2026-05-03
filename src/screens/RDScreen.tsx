/**
 * ReturnX - RD Calculator Screen
 * Recurring Deposit — Har Months Thodi Thodi Bachat
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
import { AdBannerPlaceholder } from '../components/AdBannerPlaceholder';
import { BarChart } from '../components/BarChart';
import { DonutChart } from '../components/DonutChart';
import { ErrorMessage, RateQuickSelect, validateInputs, Toast } from '../components/ErrorMessage';
import { calcRD, calcRDYearWise, POPULAR_RD_RATES } from '../logic/rd';
import { useAppStore } from '../store/appStore';
import { parseInput, formatINR } from '../utils/format';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

export default function RDScreen() {
  const [monthly, setMonthly] = useState('5000');
  const [rate, setRate] = useState('6.7');
  const [months, setMonths] = useState('24');
  const [result, setResult] = useState<ReturnType<typeof calcRD> | null>(null);
  const [yearWise, setYearWise] = useState<ReturnType<typeof calcRDYearWise>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  

  const monthlyRef = useRef(monthly);
  const rateRef = useRef(rate);
  const monthsRef = useRef(months);
  monthlyRef.current = monthly;
  rateRef.current = rate;
  monthsRef.current = months;


  const calculate = () => {
    const P = parseInput(monthlyRef.current);
    const R = parseInput(rateRef.current);
    const M = parseInput(monthsRef.current);

    const validation = validateInputs({
      monthly: { value: P, label: 'Maasik Raqam', min: 100 },
      months: { value: M, label: 'Muddat', min: 6, max: 120 },
    });

    setErrors(validation.errors);
    if (!validation.valid) return;

    const res = calcRD(P, R, M);
    setResult(res);
    setYearWise(calcRDYearWise(P, R, M));
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

        <ScreenHeader title="💳 RD Calculator" subtitle="Recurring Deposit — Thodi Thodi Bachat" />

        {/* Why RD banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            🏦 <Text style={styles.infoBold}>RD Kyun?</Text> Salary mein se thoda thoda bachao aur guaranteed return pao — bina risk ke!
          </Text>
        </View>

        <View style={styles.section}>
          <RateQuickSelect
            title="Jaldi Dar Bharein"
            rates={POPULAR_RD_RATES}
            onSelect={(r) => { setRate(String(r)); setTimeout(() => calculate(), 100); }}
          />
          <InputCard
            label="Monthly Investment"
            defaultValue={monthly}
            onChangeText={handleInput(setMonthly, monthlyRef)} prefix="₹" placeholder="5,000" hint="Start with as little as ₹100" />
          <ErrorMessage message={errors.monthly || null} />
          <InputCard
            label="Interest Rate"
            defaultValue={rate}
            onChangeText={handleInput(setRate, rateRef)} prefix="" suffix="% p.a." placeholder="6.7" keyboardType="decimal-pad" hint="Post Office RD: 6.7% | SBI: 6.5%" />
          <InputCard
            label="Duration (Months)"
            defaultValue={months}
            onChangeText={handleInput(setMonths, monthsRef)} prefix="" suffix="Months" placeholder="24" hint="Post Office RD minimum 5 years (60 mahine)" />
          <ErrorMessage message={errors.months || null} />
        </View>

        <TouchableOpacity style={styles.calcBtn} onPress={onPressCalculate} activeOpacity={0.8}>
          <Text style={styles.calcBtnText}>Maturity Dekhein 💳</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.section}>
            <ResultCard
              title="RD Pakne Par Milega"
              mainAmount={result.maturityAmount}
              mainLabel="Maturity Raqam"
              rows={[
                { label: 'Total Amount Invested', value: result.totalDeposited },
                { label: 'Bank Ka Tohfa (Byaj) 🎁', value: result.totalInterest, highlight: true, color: COLORS.accent },
                { label: 'Har Months Ka Kharcha', value: result.monthlyAmount },
              ]}
              disclaimer="Yeh estimate hai. Actual returns alag ho sakti hain. Financial advice nahi."
            />

            <DonutChart
              title="Investment vs Earnings"
              segments={[
                { value: result.totalDeposited, color: COLORS.primaryLight, label: 'Your Money' },
                { value: result.totalInterest, color: COLORS.accent, label: 'Bank Byaj 🎁' },
              ]}
              centerLabel="Kul"
              centerValue={result.maturityAmount}
            />

            {yearWise.length > 1 && (
              <BarChart
                title="Year-by-Year Growth 📊"
                data={yearWise.map(y => ({
                  label: `Y${y.year}`,
                  value1: y.deposited,
                  value2: y.maturityValue - y.deposited,
                  value1Label: 'Deposited',
                  value2Label: 'Interest Earned',
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark },
  content: { paddingBottom: SPACING.xxxl },
  infoBanner: { margin: SPACING.base, marginBottom: 0, backgroundColor: 'rgba(41, 121, 255, 0.08)', borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.chart2 + '44' },
  infoText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, lineHeight: 18 },
  infoBold: { fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.chart2 },
  section: { padding: SPACING.base },
  calcBtn: { backgroundColor: COLORS.chart2, borderRadius: RADIUS.lg, marginHorizontal: SPACING.base, paddingVertical: SPACING.base, alignItems: 'center', shadowColor: COLORS.chart2, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  calcBtnText: { color: COLORS.white, fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, letterSpacing: 0.5 },
});
