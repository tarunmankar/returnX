/**
 * ReturnX - Stock Profit Calculator Screen
 * A strictly mathematical utility for calculating absolute stock profit/loss.
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
import { calcStockProfit } from '../logic/stock';
import { useAppStore } from '../store/appStore';
import { parseInput, isValidInput, formatINR, formatINRShort } from '../utils/format';
import { shareToWhatsApp } from '../utils/share';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

export default function StockProfitScreen() {
  const [buyPrice, setBuyPrice] = useState('100');
  const [sellPrice, setSellPrice] = useState('150');
  const [quantity, setQuantity] = useState('50');
  const [result, setResult] = useState<ReturnType<typeof calcStockProfit> | null>(null);
  
  const { incrementCalcCount, saveCalculation } = useAppStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buyPriceRef = useRef(buyPrice);
  const sellPriceRef = useRef(sellPrice);
  const qtyRef = useRef(quantity);



  const calculate = () => {
    const B = parseInput(buyPriceRef.current);
    const S = parseInput(sellPriceRef.current);
    const Q = parseInput(qtyRef.current);
    
    if (!isValidInput(B) || !isValidInput(S) || !isValidInput(Q)) return;
    
    const res = calcStockProfit(B, S, Q);
    setResult(res);
  };

  const onPressCalculate = () => { calculate(); incrementCalcCount(); };

  const handleSave = () => {
    if (!result) return;
    saveCalculation({
      type: 'StockProfit',
      label: `Stock P&L: ${formatINRShort(result.profitLoss)}`,
      result: result.profitLoss,
      inputs: { buy: parseInput(buyPriceRef.current), sell: parseInput(sellPriceRef.current), qty: parseInput(qtyRef.current) },
    });
  };

  const handleShare = () => {
    if (!result) return;
    shareToWhatsApp('Stock Profit/Loss', [
      `Buy Price: ${formatINR(parseInput(buyPriceRef.current))}`,
      `Sell Price: ${formatINR(parseInput(sellPriceRef.current))}`,
      `Quantity: ${qtyRef.current} Shares`,
      `*Total Invested: ${formatINR(result.totalInvested)}*`,
      `*Current Value: ${formatINR(result.totalValue)}*`,
      `*Net ${result.isProfit ? 'Profit' : 'Loss'}: ${formatINR(result.profitLoss)} (${result.returnPercent.toFixed(2)}%)*`
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
        <ScreenHeader title="💹 Stock Profit Calculator" subtitle="Absolute ROI & Profit/Loss" accentColor={COLORS.risk} />

        <View style={styles.section}>
          <InputCard
            label="Buy Price (Avg)"
            defaultValue={buyPrice}
            onChangeText={handleInput(setBuyPrice, buyPriceRef)} prefix="₹" placeholder="100.00" keyboardType="decimal-pad" />
          <InputCard
            label="Current / Sell Price"
            defaultValue={sellPrice}
            onChangeText={handleInput(setSellPrice, sellPriceRef)} prefix="₹" placeholder="150.00" keyboardType="decimal-pad" />
          <InputCard
            label="Quantity of Shares"
            defaultValue={quantity}
            onChangeText={handleInput(setQuantity, qtyRef)} prefix="" suffix="Shares" placeholder="50" keyboardType="numeric" />
        </View>

        <TouchableOpacity style={styles.calcBtn} onPress={onPressCalculate} activeOpacity={0.8}>
          <Text style={styles.calcBtnText}>Calculate P&L 🚀</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.section}>
            <ResultCard
              title={result.isProfit ? "Stock Profit Summary" : "Stock Loss Summary"}
              mainAmount={result.profitLoss}
              mainLabel={result.isProfit ? "Net Profit" : "Net Loss"}
              accentColor={result.isProfit ? COLORS.accent : COLORS.risk}
              rows={[
                { label: 'Total Invested', value: result.totalInvested },
                { label: 'Current Value', value: result.totalValue },
                { label: 'Absolute Return', value: result.returnPercent, isPercent: true, highlight: true, color: result.isProfit ? COLORS.accent : COLORS.risk },
              ]}
              disclaimer="PURELY MATHEMATICAL CALCULATION. Not financial advice. Does not include taxes, brokerage, or inflation."
            />
            <ResultActions onSave={handleSave} onShare={handleShare} />
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
  section: { padding: SPACING.base },
  calcBtn: { backgroundColor: COLORS.risk, borderRadius: RADIUS.lg, marginHorizontal: SPACING.base, paddingVertical: SPACING.base, alignItems: 'center', shadowColor: COLORS.risk, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  calcBtnText: { color: COLORS.white, fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, letterSpacing: 0.5 },
});
