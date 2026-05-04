import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { InputCard } from '../components/InputCard';
import { ResultCard } from '../components/ResultCard';
import { ResultActions } from '../components/ResultActions';
import { ErrorMessage, validateInputs } from '../components/ErrorMessage';
import { DonutChart } from '../components/DonutChart';
import { calcLIC } from '../logic/lic';
import { useAppStore } from '../store/appStore';
import { parseInput, formatINR, formatINRShort } from '../utils/format';
import { shareToWhatsApp } from '../utils/share';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

type PlanKey = 'utsav' | 'umang';

const PLANS = {
  utsav: { label: 'Jeevan Utsav (Plan 871)', emoji: '🌟', premTerms: [5, 10, 15] },
  umang: { label: 'Jeevan Umang (Plan 945)', emoji: '🌼', premTerms: [15, 20, 25, 30] },
};

export default function LICScreen() {
  const [plan, setPlan] = useState<PlanKey>('utsav');
  const [sumAssured, setSumAssured] = useState('1000000');
  const [annualPremium, setAnnualPremium] = useState('80000');
  const [premiumTerm, setPremiumTerm] = useState('10');
  const [result, setResult] = useState<ReturnType<typeof calcLIC> | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { incrementCalcCount, saveCalculation } = useAppStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saRef = useRef(sumAssured);
  const premRef = useRef(annualPremium);
  const termRef = useRef(premiumTerm);

  const calculate = () => {
    const SA = parseInput(saRef.current);
    const AP = parseInput(premRef.current);
    const T = parseInput(termRef.current);

    const validation = validateInputs({
      sumAssured: { value: SA, label: 'Sum Assured', min: 100000 },
      annualPremium: { value: AP, label: 'Annual Premium', min: 1000 },
      premiumTerm: { value: T, label: 'Premium Paying Term', min: 5, max: 30 },
    });
    setErrors(validation.errors);
    if (!validation.valid) return;

    const res = calcLIC(SA, AP, T, 40);
    setResult(res);
  };

  const onPressCalculate = () => { calculate(); incrementCalcCount(); };

  const handleSave = () => {
    if (!result) return;
    saveCalculation({
      type: 'LIC',
      label: `LIC ${PLANS[plan].label} - ${formatINRShort(parseInput(saRef.current))} SA`,
      result: result.yearlySurvivalBenefit,
      inputs: { 
        sumAssured: parseInput(saRef.current), 
        premium: parseInput(premRef.current), 
        term: parseInput(termRef.current), 
        plan: plan === 'umang' ? 1 : 2 
      },
    });
  };

  const handleShare = () => {
    if (!result) return;
    shareToWhatsApp(`LIC ${PLANS[plan].label}`, [
      `Sum Assured: ${formatINR(parseInput(saRef.current))}`,
      `Annual Premium: ${formatINR(parseInput(premRef.current))}`,
      `Paying Term: ${termRef.current} Years`,
      `*Yearly Survival Benefit: ${formatINR(result.yearlySurvivalBenefit)}*`,
      `*Total Benefit (20yrs): ${formatINR(result.yearlySurvivalBenefit * 20)}*`
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
        <ScreenHeader title="🛡️ LIC Calculator" subtitle="Jeevan Utsav & Jeevan Umang" />

        {/* Plan Selector */}
        <View style={styles.planRow}>
          {(Object.keys(PLANS) as PlanKey[]).map((k) => (
            <TouchableOpacity
              key={k}
              style={[styles.planChip, plan === k && styles.planChipActive]}
              onPress={() => { setPlan(k); setResult(null); }}
            >
              <Text style={styles.planEmoji}>{PLANS[k].emoji}</Text>
              <Text style={[styles.planLabel, plan === k && styles.planLabelActive]}>{PLANS[k].label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Feature Banner */}
        <View style={styles.featureBanner}>
          <Text style={styles.featureTitle}>🎯 How It Works</Text>
          <Text style={styles.featureText}>
            You pay premium for <Text style={styles.bold}>{premiumTerm} years</Text>. After that, LIC pays you{' '}
            <Text style={styles.boldGreen}>10% of your Sum Assured every year FOR LIFE</Text>.{'\n'}
            Death benefit (full Sum Assured) is paid to nominee separately.
          </Text>
        </View>

        <View style={styles.section}>
          <InputCard
            label="Sum Assured (Bima Rashi)"
            defaultValue={sumAssured}
            onChangeText={handleInput(setSumAssured, saRef)}
            prefix="₹"
            placeholder="10,00,000"
            hint="The amount you choose for insurance coverage"
          />
          <ErrorMessage message={errors.sumAssured || null} />
          <InputCard
            label="Annual Premium"
            defaultValue={annualPremium}
            onChangeText={handleInput(setAnnualPremium, premRef)}
            prefix="₹"
            placeholder="80,000"
            hint="Check exact premium from LIC agent/website based on your age"
          />
          <ErrorMessage message={errors.annualPremium || null} />
          <InputCard
            label="Premium Paying Term (Years)"
            defaultValue={premiumTerm}
            onChangeText={handleInput(setPremiumTerm, termRef)}
            prefix=""
            suffix="Years"
            placeholder="10"
            hint="Number of years you'll pay premium"
          />
          <ErrorMessage message={errors.premiumTerm || null} />

          {/* Quick term presets */}
          <View style={styles.presetRow}>
            <Text style={styles.presetLabel}>Premium Terms:</Text>
            {PLANS[plan].premTerms.map((t) => (
              <TouchableOpacity
                key={t}
                style={styles.presetChip}
                onPress={() => { setPremiumTerm(String(t)); termRef.current = String(t); setTimeout(() => calculate(), 100); }}
              >
                <Text style={styles.presetChipText}>{t} Yrs</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.calcBtn} onPress={onPressCalculate} activeOpacity={0.8}>
          <Text style={styles.calcBtnText}>Calculate LIC Returns 🛡️</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.section}>

            {/* Main Result Card */}
            <ResultCard
              title={`${PLANS[plan].emoji} ${PLANS[plan].label}`}
              mainAmount={result.yearlySurvivalBenefit}
              mainLabel="Yearly Survival Benefit (For Life!)"
              accentColor="#E91E63"
              principalAmount={result.totalPremiumPaid}
              interestAmount={result.yearlySurvivalBenefit * 20 - result.totalPremiumPaid}
              rows={[
                { label: 'Monthly Income', value: result.monthlySurvivalBenefit },
                { label: 'Death Benefit (to Nominee)', value: result.sumAssured, color: COLORS.warning },
                { label: '💰 Projected 20yr Total Income', value: result.yearlySurvivalBenefit * 20, highlight: true, color: '#E91E63' },
                ...(result.breakEvenYear > 0 ? [
                  { label: `Break-Even (Year ${result.breakEvenYear})`, value: result.yearlySurvivalBenefit * (result.breakEvenYear - result.premiumPayingTerm), color: COLORS.chart2 },
                ] : []),
              ]}
              disclaimer="10% annual survival benefit is guaranteed. Actual premium depends on age, policy term & LIC's current rates. Not financial advice."
            />

            {/* Break-even callout */}
            {result.breakEvenYear > 0 && (
              <View style={styles.breakEvenCard}>
                <Text style={styles.breakEvenIcon}>⏱️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.breakEvenTitle}>Break-Even Point: Year {result.breakEvenYear}</Text>
                  <Text style={styles.breakEvenText}>
                    After year {result.breakEvenYear}, your total survival benefits received will exceed your total premiums paid. From then on, it's pure profit — for LIFE!
                  </Text>
                </View>
              </View>
            )}

            {/* Chart */}
            <DonutChart
              title="Premium vs Lifetime Income"
              segments={[
                { value: result.totalPremiumPaid, color: COLORS.primaryLight, label: 'Premium Paid' },
                { value: result.yearlySurvivalBenefit * 20, color: '#E91E63', label: '20yr Benefits' },
              ]}
              centerLabel="Benefit"
              centerValue={result.yearlySurvivalBenefit * 20}
            />

            <ResultActions onSave={handleSave} onShare={handleShare} />

            {/* Year-by-year table toggle */}
            <TouchableOpacity style={styles.tableToggle} onPress={() => setShowTable(!showTable)}>
              <Text style={styles.tableToggleText}>{showTable ? '▲' : '▼'} Year-by-Year Cash Flow</Text>
            </TouchableOpacity>

            {showTable && (
              <View style={styles.tableCard}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { flex: 0.5 }]}>Yr</Text>
                  <Text style={styles.tableHeaderText}>Benefit</Text>
                  <Text style={styles.tableHeaderText}>Cum. Rcvd</Text>
                  <Text style={styles.tableHeaderText}>Net P&L</Text>
                </View>
                {result.projectionRows.map((row) => (
                  <View key={row.year} style={[styles.tableRow, row.year === result.breakEvenYear && styles.breakEvenRow]}>
                    <Text style={[styles.tableCell, { flex: 0.5, color: COLORS.textSecondary }]}>{row.year}</Text>
                    <Text style={styles.tableCell}>{row.survivalBenefit > 0 ? formatINR(row.survivalBenefit) : '—'}</Text>
                    <Text style={[styles.tableCell, { color: COLORS.accent }]}>{formatINR(row.cumulativeBenefit)}</Text>
                    <Text style={[styles.tableCell, { color: row.netPosition >= 0 ? COLORS.accent : COLORS.risk, fontWeight: '700' }]}>
                      {row.netPosition >= 0 ? '+' : ''}{formatINR(row.netPosition, false)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark },
  content: { paddingBottom: SPACING.xxxl },
  planRow: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.base, paddingBottom: 0 },
  planChip: { flex: 1, backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.lg, padding: SPACING.sm, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  planChipActive: { borderColor: '#E91E63', backgroundColor: 'rgba(233,30,99,0.08)' },
  planEmoji: { fontSize: 22, marginBottom: 4 },
  planLabel: { fontSize: 10, color: COLORS.textSecondary, textAlign: 'center', fontWeight: '600' },
  planLabelActive: { color: '#E91E63' },
  featureBanner: { margin: SPACING.base, marginTop: SPACING.sm, backgroundColor: 'rgba(233,30,99,0.07)', borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: 'rgba(233,30,99,0.3)' },
  featureTitle: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: '#E91E63', marginBottom: SPACING.xs },
  featureText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, lineHeight: 20 },
  bold: { fontWeight: '700', color: COLORS.textPrimary },
  boldGreen: { fontWeight: '700', color: COLORS.accent },
  section: { padding: SPACING.base },
  presetRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, flexWrap: 'wrap', marginTop: SPACING.xs },
  presetLabel: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textMuted },
  presetChip: { backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.border },
  presetChipText: { fontSize: TYPOGRAPHY.fontSize.xs, color: '#E91E63', fontWeight: TYPOGRAPHY.fontWeight.semibold },
  calcBtn: { backgroundColor: '#E91E63', borderRadius: RADIUS.lg, marginHorizontal: SPACING.base, paddingVertical: SPACING.base, alignItems: 'center', shadowColor: '#E91E63', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  calcBtnText: { color: '#fff', fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, letterSpacing: 0.5 },
  breakEvenCard: { flexDirection: 'row', gap: SPACING.sm, backgroundColor: 'rgba(0,200,83,0.08)', borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.accent + '44', marginTop: SPACING.sm },
  breakEvenIcon: { fontSize: 22 },
  breakEvenTitle: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.accent, marginBottom: 4 },
  breakEvenText: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textSecondary, lineHeight: 18 },
  tableToggle: { backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', marginTop: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  tableToggleText: { color: '#E91E63', fontWeight: TYPOGRAPHY.fontWeight.semibold, fontSize: TYPOGRAPHY.fontSize.sm },
  tableCard: { backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.xl, overflow: 'hidden', marginTop: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  tableHeader: { flexDirection: 'row', backgroundColor: COLORS.primary, padding: SPACING.sm },
  tableHeaderText: { flex: 1, color: COLORS.textSecondary, fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: TYPOGRAPHY.fontWeight.bold, textAlign: 'center' },
  tableRow: { flexDirection: 'row', padding: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  breakEvenRow: { backgroundColor: 'rgba(0,200,83,0.06)' },
  tableCell: { flex: 1, fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textPrimary, textAlign: 'center' },
});
