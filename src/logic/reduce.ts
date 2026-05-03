/**
 * ReturnX - Reducing Balance Interest Logic
 * Month-by-month breakdown of interest vs principal
 */

export interface ReduceBalanceRow {
  month: number;
  openingBalance: number;
  interest: number;
  principal: number;
  closingBalance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

/**
 * Reducing balance calculation — returns full monthly breakdown
 * Each month, interest is charged only on outstanding principal
 *
 * @param P - Principal amount
 * @param R - Annual interest rate (percentage)
 * @param months - Tenure in months
 */
export function calcReducingBalance(P: number, R: number, months: number): ReduceBalanceRow[] {
  if (P <= 0 || months <= 0) return [];

  const r = R / 100 / 12; // monthly rate
  const emi = R > 0
    ? (P * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
    : P / months;

  const result: ReduceBalanceRow[] = [];
  let balance = P;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;

  for (let m = 1; m <= months; m++) {
    const openingBalance = balance;
    const interest = R > 0 ? Math.round(balance * r) : 0;
    const principal = Math.round(emi - interest);
    balance = Math.max(0, Math.round(balance - principal));

    cumulativeInterest += interest;
    cumulativePrincipal += principal;

    result.push({
      month: m,
      openingBalance: Math.round(openingBalance),
      interest,
      principal,
      closingBalance: balance,
      cumulativeInterest: Math.round(cumulativeInterest),
      cumulativePrincipal: Math.round(cumulativePrincipal),
    });

    if (balance === 0) break;
  }

  return result;
}

/**
 * Summary of reducing balance loan
 */
export interface ReduceBalanceSummary {
  emi: number;
  totalInterest: number;
  totalPrincipal: number;
  interestPercentage: number; // % of total payment that is interest
  effectiveCost: number; // total payment / principal
}

export function calcReducingBalanceSummary(P: number, R: number, months: number): ReduceBalanceSummary {
  const schedule = calcReducingBalance(P, R, months);
  if (schedule.length === 0) {
    return { emi: 0, totalInterest: 0, totalPrincipal: P, interestPercentage: 0, effectiveCost: 1 };
  }
  const last = schedule[schedule.length - 1];
  const totalInterest = last.cumulativeInterest;
  const totalPayment = P + totalInterest;
  const emi = schedule[0].interest + schedule[0].principal;

  return {
    emi,
    totalInterest,
    totalPrincipal: P,
    interestPercentage: Math.round((totalInterest / totalPayment) * 100),
    effectiveCost: Math.round((totalPayment / P) * 100) / 100,
  };
}

// Dev test
// const schedule = calcReducingBalance(1000000, 10, 24);
// console.log('Reducing Balance Test (10L, 10%, 24mo):', schedule[0], '... last:', schedule[schedule.length - 1]);
