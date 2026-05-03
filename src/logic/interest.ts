/**
 * ReturnX - Core Interest Calculation Logic
 * Pure math functions — no UI dependencies
 */

export interface SimpleInterestResult {
  interest: number;
  totalAmount: number;
  principal: number;
  rate: number;
  time: number;
}

export interface CompoundInterestResult {
  interest: number;
  totalAmount: number;
  principal: number;
  rate: number;
  time: number;
  frequency: number;
  effectiveRate: number;
}

/**
 * Simple Interest: SI = (P * R * T) / 100
 * @param P - Principal amount
 * @param R - Annual rate (percentage)
 * @param T - Time in years
 */
export function calcSimpleInterest(P: number, R: number, T: number): SimpleInterestResult {
  if (P <= 0 || R <= 0 || T <= 0) {
    return { interest: 0, totalAmount: P, principal: P, rate: R, time: T };
  }
  const interest = (P * R * T) / 100;
  const totalAmount = P + interest;
  return { interest, totalAmount, principal: P, rate: R, time: T };
}

/**
 * Compound Interest (Lump Sum): A = P * (1 + R/100/n)^(n*T)
 * @param P - Principal amount
 * @param R - Annual rate (percentage)
 * @param T - Time in years
 * @param n - Compounding frequency per year (1=yearly, 2=half-yearly, 4=quarterly, 12=monthly)
 */
export function calcCompoundInterest(P: number, R: number, T: number, n: number = 12): CompoundInterestResult {
  if (P <= 0 || R <= 0 || T <= 0) {
    return {
      interest: 0,
      totalAmount: P,
      principal: P,
      rate: R,
      time: T,
      frequency: n,
      effectiveRate: 0,
    };
  }
  const totalAmount = P * Math.pow(1 + (R / 100) / n, n * T);
  const interest = totalAmount - P;
  const effectiveRate = (Math.pow(1 + (R / 100) / n, n) - 1) * 100;
  return { interest, totalAmount, principal: P, rate: R, time: T, frequency: n, effectiveRate };
}

/**
 * Year-wise breakdown for compound interest chart
 */
export function calcCompoundYearWise(P: number, R: number, T: number, n: number = 12): { year: number; amount: number; interest: number }[] {
  const result = [];
  for (let y = 1; y <= T; y++) {
    const amount = P * Math.pow(1 + (R / 100) / n, n * y);
    result.push({ year: y, amount: Math.round(amount), interest: Math.round(amount - P) });
  }
  return result;
}

// Dev test (comment out in prod)
// const si = calcSimpleInterest(100000, 8, 5);
// console.log('SI Test:', si); // Should show 40000 interest, 140000 total

// const ci = calcCompoundInterest(100000, 8, 5, 12);
// console.log('CI Test:', ci); // Should show ~148,977 total
