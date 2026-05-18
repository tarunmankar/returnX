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

function getStepUpMultiplier(stepUpRate: number, monthIndex: number): number {
  if (stepUpRate <= 0) return 1;
  const yearlyIncrements = Math.floor((monthIndex - 1) / 12);
  return Math.pow(1 + stepUpRate / 100, yearlyIncrements);
}

/**
 * SIP Future Value Formula:
 * FV = P * ((1+r)^months - 1) / r * (1+r)
 * where r = R/100/12 (monthly rate)
 *
 * @param P - Monthly SIP amount
 * @param R - Annual rate (percentage)
 * @param T - Time in years
 * @param stepUpRate - Annual SIP increase percentage
 */
export function calcSIP(P: number, R: number, T: number, stepUpRate: number = 0): SIPResult {
  if (P <= 0 || R <= 0 || T <= 0) {
    const months = T * 12;
    return {
      futureValue: P * months,
      totalInvested: P * months,
      totalReturns: 0,
      monthlyAmount: P,
      annualRate: R,
      years: T,
      wealthRatio: 1,
    };
  }
  const r = R / 100 / 12; // monthly rate
  const months = T * 12;
  let futureValue = 0;
  let totalInvested = 0;

  for (let month = 1; month <= months; month++) {
    futureValue *= 1 + r;
    const contribution = P * getStepUpMultiplier(stepUpRate, month);
    futureValue += contribution;
    totalInvested += contribution;
  }

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
export function calcSIPYearWise(P: number, R: number, T: number, stepUpRate: number = 0): SIPYearBreakdown[] {
  const r = R / 100 / 12;
  const result: SIPYearBreakdown[] = [];
  let invested = 0;
  let futureValue = 0;

  for (let month = 1; month <= T * 12; month++) {
    futureValue *= R > 0 ? 1 + r : 1;
    const contribution = P * getStepUpMultiplier(stepUpRate, month);
    futureValue += contribution;
    invested += contribution;

    if (month % 12 === 0) {
      result.push({
        year: month / 12,
        invested: Math.round(invested),
        futureValue: Math.round(futureValue),
        returns: Math.round(futureValue - invested),
      });
    }
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

export function calcRequiredSIPForGoal(targetAmount: number, R: number, T: number, stepUpRate: number = 0): number {
  if (targetAmount <= 0 || T <= 0) return 0;
  if (R <= 0) return Math.ceil(targetAmount / (T * 12));

  let low = 0;
  let high = targetAmount;

  for (let i = 0; i < 40; i++) {
    const mid = (low + high) / 2;
    const projected = calcSIP(mid, R, T, stepUpRate).futureValue;
    if (projected >= targetAmount) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return Math.ceil(high);
}

export function calcRequiredLumpSumForGoal(targetAmount: number, R: number, T: number): number {
  if (targetAmount <= 0) return 0;
  if (R <= 0 || T <= 0) return Math.ceil(targetAmount);

  const monthlyRate = R / 100 / 12;
  const months = T * 12;
  const growthFactor = Math.pow(1 + monthlyRate, months);
  return Math.ceil(targetAmount / growthFactor);
}

export function calcInflationAdjustedValue(amount: number, inflationRate: number, years: number): number {
  if (amount <= 0) return 0;
  if (inflationRate <= 0 || years <= 0) return Math.round(amount);
  return Math.round(amount / Math.pow(1 + inflationRate / 100, years));
}

// Dev test
// const sip = calcSIP(10000, 12, 10);
// console.log('SIP Test (₹10k/mo, 12%, 10yr):', sip);
// Expected: ~23 lakhs future value
