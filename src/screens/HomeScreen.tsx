/**
 * ReturnX - Home Screen (v2 - Indian Audience Edition)
 * 2-column grid with 10 calculators + Indian flavor
 */

import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAppStore } from '../store/appStore';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';
import { LogoWithBg } from '../components/LogoIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.base * 3) / 2;

interface CalcItem {
  id: string;
  title: string;
  titleSecondary: string;
  subtitle: string;
  icon: string;
  route: string;
  tag?: string;
  tagColor?: string;
  accentColor?: string;
}

const CALCULATORS: CalcItem[] = [
  // ── HIGH RISK / HIGH RETURN ──
  {
    id: 'stockprofit',
    title: 'Stock ROI & Profit',
    titleSecondary: 'Absolute Return',
    subtitle: 'Calculate exact Profit/Loss %',
    icon: '💹',
    route: '/screens/stock-profit',
    tag: 'Safe Utility',
    tagColor: '#D50000',
  },
  {
    id: 'lumpsum',
    title: 'Mutual Fund Lump Sum',
    titleSecondary: 'One-time Investment',
    subtitle: 'Direct Stocks or Lumpsum Mutual Funds',
    icon: '🪙',
    route: '/screens/lumpsum',
    tag: 'Market Risk',
    tagColor: '#FF6D00',
  },
  {
    id: 'sip',
    title: 'Mutual Fund SIP',
    titleSecondary: 'Monthly Investment',
    subtitle: 'Systematic Investment Plan',
    icon: '📈',
    route: '/screens/sip',
    tag: 'Market Risk',
    tagColor: '#FF6D00',
  },
  // ── MEDIUM RISK / MEDIUM RETURN ──
  {
    id: 'lic',
    title: 'LIC Calculator',
    titleSecondary: 'Jeevan Utsav / Umang',
    subtitle: '10% of SA every year for LIFE',
    icon: '🛡️',
    route: '/screens/lic',
    tag: 'Guaranteed',
    tagColor: '#E91E63',
  },
  {
    id: 'fd',
    title: 'FD',
    titleSecondary: 'Fixed Deposit',
    subtitle: 'Secure guaranteed bank savings',
    icon: '🏦',
    route: '/screens/fd',
  },
  {
    id: 'rd',
    title: 'RD',
    titleSecondary: 'Recurring Deposit',
    subtitle: 'Monthly savings, fixed return',
    icon: '💳',
    route: '/screens/rd',
  },
  {
    id: 'sbiannuity',
    title: 'SBI Annuity',
    titleSecondary: 'Fixed Monthly Payout',
    subtitle: 'Deposit once, get monthly income',
    icon: '💰',
    route: '/screens/sbi-annuity',
    tag: 'New ✨',
    tagColor: COLORS.chart1,
  },
  // ── NO RISK / GUARANTEED RETURN ──
  {
    id: 'ppf',
    title: 'PPF',
    titleSecondary: 'Tax-Free Savings',
    subtitle: 'Govt backed • EEE Tax Status',
    icon: '🏛️',
    route: '/screens/ppf',
    tag: 'Tax Free',
    tagColor: COLORS.accent,
  },
  {
    id: 'ssy',
    title: 'SSY',
    titleSecondary: 'Sukanya Samriddhi',
    subtitle: 'For girl child — Tax Free',
    icon: '👧',
    route: '/screens/ssy',
    tag: 'EEE',
    tagColor: '#E91E63',
  },
  {
    id: 'nsc',
    title: 'NSC',
    titleSecondary: 'National Savings Cert.',
    subtitle: '5 year tax saving bond',
    icon: '📜',
    route: '/screens/nsc',
    tag: '80C',
    tagColor: COLORS.accentLight,
  },
  {
    id: 'scss',
    title: 'SCSS',
    titleSecondary: 'Senior Citizen Savings',
    subtitle: 'Quarterly payout for 60+ age',
    icon: '👴',
    route: '/screens/scss',
    tag: '8.2%',
    tagColor: COLORS.chart2,
  },
  {
    id: 'pomis',
    title: 'POMIS',
    titleSecondary: 'Post Office Monthly',
    subtitle: 'Monthly income, no risk',
    icon: '📮',
    route: '/screens/pomis',
    tag: '7.4%',
    tagColor: COLORS.chart2,
  },
  // ── LOANS & EMI ──
  {
    id: 'emi',
    title: 'EMI Calculator',
    titleSecondary: 'Loan Installment',
    subtitle: 'Monthly EMI & total interest',
    icon: '🏠',
    route: '/screens/emi',
  },
  {
    id: 'reducing',
    title: 'Reducing Balance',
    titleSecondary: 'Monthly Amortization',
    subtitle: 'Month-by-month loan breakdown',
    icon: '📊',
    route: '/screens/reducing-balance',
  },
  {
    id: 'compare',
    title: 'Loan vs Invest (EMI)',
    titleSecondary: 'Which is better?',
    subtitle: 'Pay off loan or invest in SIP?',
    icon: '⚖️',
    route: '/screens/compare',
    tag: 'Hero ⭐',
    tagColor: COLORS.warning,
  },
  {
    id: 'netreturn',
    title: 'Net Return (Portfolio)',
    titleSecondary: 'Investments vs Loan',
    subtitle: 'Calculate Final Net +/- Position',
    icon: '🧾',
    route: '/screens/net-return',
    tag: 'Net Worth',
    tagColor: COLORS.accent,
  },
  // ── BASIC CALCULATORS ──
  {
    id: 'simple',
    title: 'Simple Interest',
    titleSecondary: 'Basic Return',
    subtitle: 'SI = PRT/100',
    icon: '🧮',
    route: '/screens/simple-interest',
  },
  {
    id: 'compound',
    title: 'Compound Interest',
    titleSecondary: 'Power of Compounding',
    subtitle: 'Interest on interest',
    icon: '⚡',
    route: '/screens/compound-interest',
  },
];

// ── Risk-based Categories ──
const CATEGORIES = [
  {
    title: '🔴 High Risk · Stock Market',
    subtitle: 'Direct Investment in Equity',
    ids: ['stockprofit'],
    headerColor: '#D50000',
  },
  {
    title: '🟠 Medium Risk · Mutual Funds',
    subtitle: 'Market Linked SIPs & Lumpsum',
    ids: ['sip', 'lumpsum'],
    headerColor: '#FF6D00',
  },
  {
    title: '🟡 Low Risk · Fixed Income',
    subtitle: 'Bank FD, RD & Insurance',
    ids: ['lic', 'fd', 'rd', 'sbiannuity'],
    headerColor: '#FFD600',
  },
  {
    title: '🟢 No Risk · Govt Guaranteed',
    subtitle: 'Safe Govt Schemes (PPF, SSY, etc.)',
    ids: ['ppf', 'ssy', 'nsc', 'scss', 'pomis'],
    headerColor: '#00C853',
  },
  {
    title: '🏦 Loans & EMI',
    subtitle: 'Plan & manage your loans',
    ids: ['emi', 'reducing', 'compare', 'netreturn'],
    headerColor: COLORS.warning,
  },
  {
    title: '🧮 Basic Calculators',
    subtitle: 'Simple math for interest',
    ids: ['simple', 'compound'],
    headerColor: COLORS.textMuted,
  },
];

export default function HomeScreen() {
  const { loadHistory, history } = useAppStore();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Hero Header ── */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top + SPACING.md, SPACING.xxxl) }]}>
          <View style={styles.logoRow}>
            <LogoWithBg size={52} bgColor={COLORS.primary} />
            <View>
              <Text style={styles.logoText}>ReturnX</Text>
              <Text style={styles.tagline}>Nivesh Calculator</Text>
            </View>
          </View>
        </View>

        {/* ── Calculator Categories ── */}
        {CATEGORIES.map((cat) => {
          const items = CALCULATORS.filter(c => cat.ids.includes(c.id));
          return (
            <View key={cat.title}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: (cat as any).headerColor || COLORS.textPrimary }]}>{cat.title}</Text>
                {(cat as any).subtitle && <Text style={styles.sectionSubtitle}>{(cat as any).subtitle}</Text>}
              </View>
              <View style={styles.grid}>
                {items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.calcCard}
                    onPress={() => router.push(item.route as any)}
                    activeOpacity={0.75}
                  >
                    {item.tag && (
                      <View style={[styles.tag, { backgroundColor: item.tagColor + '22', borderColor: item.tagColor }]}>
                        <Text style={[styles.tagText, { color: item.tagColor }]}>{item.tag}</Text>
                      </View>
                    )}
                    <Text style={styles.cardIcon}>{item.icon}</Text>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardTitleSecondary}>{item.titleSecondary}</Text>
                    <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                    <View style={styles.cardArrow}>
                      <Text style={styles.cardArrowText}>→</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}

        {/* ── Bottom Navigation Bar ── */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.bottomNavItem} onPress={() => router.push('/screens/saved')}>
            <Text style={styles.bottomNavIcon}>💾</Text>
            <Text style={styles.bottomNavText}>Saved</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomNavItem} onPress={() => router.push('/screens/disclaimer')}>
            <Text style={styles.bottomNavIcon}>⚠️</Text>
            <Text style={styles.bottomNavText}>Disclaimer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomNavItem} onPress={() => router.push('/screens/privacy')}>
            <Text style={styles.bottomNavIcon}>🔒</Text>
            <Text style={styles.bottomNavText}>Privacy</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>ReturnX - Nivesh Calculator v1.0.0 • Made with ❤️ in India 🇮🇳</Text>
        <Text style={styles.disclaimer}>Calculator only — not financial advice</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark },
  scrollContent: { paddingBottom: SPACING.xxxl },
  header: { paddingHorizontal: SPACING.base, paddingTop: SPACING.xxxl, paddingBottom: SPACING.lg, backgroundColor: COLORS.primary },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  logoText: { fontSize: TYPOGRAPHY.fontSize.xxxl, fontWeight: TYPOGRAPHY.fontWeight.extrabold, color: COLORS.textPrimary, letterSpacing: -0.5 },
  tagline: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.accent, fontWeight: TYPOGRAPHY.fontWeight.medium, letterSpacing: 0.3 },
  sectionHeader: { marginHorizontal: SPACING.base, marginTop: SPACING.xl, marginBottom: SPACING.sm },
  sectionTitle: { fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textPrimary },
  sectionSubtitle: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textMuted, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.base, gap: SPACING.md, marginTop: SPACING.sm },
  calcCard: { width: CARD_WIDTH, backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.border, position: 'relative', minHeight: 140 },
  tag: { position: 'absolute', top: SPACING.sm, right: SPACING.sm, borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 2, borderWidth: 1 },
  tagText: { fontSize: 9, fontWeight: TYPOGRAPHY.fontWeight.bold, letterSpacing: 0.3 },
  cardIcon: { fontSize: 30, marginBottom: SPACING.xs, marginTop: SPACING.xs },
  cardTitle: { fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textPrimary },
  cardTitleSecondary: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.accent, fontWeight: TYPOGRAPHY.fontWeight.medium, marginBottom: 2 },
  cardSubtitle: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textSecondary, lineHeight: 16 },
  cardArrow: { position: 'absolute', bottom: SPACING.sm, right: SPACING.sm, width: 24, height: 24, borderRadius: RADIUS.full, backgroundColor: COLORS.accent + '22', alignItems: 'center', justifyContent: 'center' },
  cardArrowText: { color: COLORS.accent, fontWeight: TYPOGRAPHY.fontWeight.bold, fontSize: TYPOGRAPHY.fontSize.sm },
  bottomNav: { flexDirection: 'row', backgroundColor: COLORS.surface, marginHorizontal: SPACING.base, marginTop: SPACING.xl, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  bottomNavItem: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md, gap: 4 },
  bottomNavIcon: { fontSize: 18 },
  bottomNavText: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textSecondary, fontWeight: TYPOGRAPHY.fontWeight.medium },
  version: { textAlign: 'center', fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textMuted, marginTop: SPACING.xl },
  disclaimer: { textAlign: 'center', fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textMuted, marginTop: 4, fontStyle: 'italic' },
});
