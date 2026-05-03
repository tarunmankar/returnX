/**
 * ReturnX - SIP (Systematic Investment Plan) Logic
 * Monthly SIP future value calculation
 */

export interface SIPResult {
  futureValue: number;
  totalInvested: number;
  totalReturns: number;
  monthlyAmount: number;
  annualRate: number;
  years: number;
  wealthRatio: number; // futureValue / totalInvested
}

export interface SIPYearBreakdown {
  year: number;
  invested: number;
  futureValue: number;
  returns: number;
}

/**
 * SIP Future Value Formula:
 * FV = P * ((1+r)^months - 1) / r * (1+r)
 * where r = R/100/12 (monthly rate)
 *
 * @param P - Monthly SIP amount
 * @param R - Annual rate (percentage)
 * @param T - Time in years
 */
export function calcSIP(P: number, R: number, T: number): SIPResult {
  if (P <= 0 || R <= 0 || T <= 0) {
    return {
      futureValue: P * T * 12,
      totalInvested: P * T * 12,
      totalReturns: 0,
      monthlyAmount: P,
      annualRate: R,
      years: T,
      wealthRatio: 1,
    };
  }
  const r = R / 100 / 12; // monthly rate
  const months = T * 12;
  const futureValue = P * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
  const totalInvested = P * months;
  const totalReturns = futureValue - totalInvested;
  const wealthRatio = futureValue / totalInvested;

  return {
    futureValue: Math.round(futureValue),
    totalInvested: Math.round(totalInvested),
    totalReturns: Math.round(totalReturns),
    monthlyAmount: P,
    annualRate: R,
    years: T,
    wealthRatio: Math.round(wealthRatio * 100) / 100,
  };
}

/**
 * SIP year-wise breakdown for charts
 */
export function calcSIPYearWise(P: number, R: number, T: number): SIPYearBreakdown[] {
  const r = R / 100 / 12;
  const result: SIPYearBreakdown[] = [];
  for (let y = 1; y <= T; y++) {
    const months = y * 12;
    const futureValue = R > 0
      ? P * ((Math.pow(1 + r, months) - 1) / r) * (1 + r)
      : P * months;
    const invested = P * months;
    result.push({
      year: y,
      invested: Math.round(invested),
      futureValue: Math.round(futureValue),
      returns: Math.round(futureValue - invested),
    });
  }
  return result;
}

/**
 * Lump Sum Growth Calculator
 * @param P - Lump sum amount
 * @param R - Annual rate (percentage)
 * @param T - Time in years
 */
export function calcLumpSum(P: number, R: number, T: number): SIPResult {
  const r = R / 100 / 12;
  const months = T * 12;
  const futureValue = R > 0
    ? P * Math.pow(1 + r, months)
    : P;
  const totalReturns = futureValue - P;
  return {
    futureValue: Math.round(futureValue),
    totalInvested: P,
    totalReturns: Math.round(totalReturns),
    monthlyAmount: 0,
    annualRate: R,
    years: T,
    wealthRatio: Math.round((futureValue / P) * 100) / 100,
  };
}

// Dev test
// const sip = calcSIP(10000, 12, 10);
// console.log('SIP Test (₹10k/mo, 12%, 10yr):', sip);
// Expected: ~23 lakhs future value
