/**
 * ReturnX - RD (Recurring Deposit) Calculator Logic
 * Indian post office / bank RD calculation
 */

export interface RDResult {
  maturityAmount: number;
  totalDeposited: number;
  totalInterest: number;
  monthlyAmount: number;
  rate: number;
  months: number;
}

/**
 * RD Maturity Formula (Quarterly compounding, standard Indian banks):
 * Each monthly deposit earns interest for remaining months
 * M = R * [(1 + r/4)^(4n/12) - 1] / [1 - (1+r/4)^(-1/3)]
 *
 * Simplified approach: Sum each installment's compound growth
 */
export function calcRD(monthlyAmount: number, R: number, months: number): RDResult {
  if (monthlyAmount <= 0 || months <= 0) {
    return { maturityAmount: 0, totalDeposited: 0, totalInterest: 0, monthlyAmount, rate: R, months };
  }

  if (R === 0) {
    const total = monthlyAmount * months;
    return { maturityAmount: total, totalDeposited: total, totalInterest: 0, monthlyAmount, rate: R, months };
  }

  // Quarterly compounding: n=4, r per quarter = R/400
  const rq = R / 400; // quarterly rate
  let maturity = 0;

  for (let m = 1; m <= months; m++) {
    // Each installment earns compound interest for remaining quarters
    const quartersRemaining = (months - m + 1) / 3;
    maturity += monthlyAmount * Math.pow(1 + rq, quartersRemaining);
  }

  const totalDeposited = monthlyAmount * months;
  const totalInterest = maturity - totalDeposited;

  return {
    maturityAmount: Math.round(maturity),
    totalDeposited: Math.round(totalDeposited),
    totalInterest: Math.round(totalInterest),
    monthlyAmount,
    rate: R,
    months,
  };
}

/**
 * Yearly RD growth for chart
 */
export function calcRDYearWise(monthlyAmount: number, R: number, totalMonths: number): {
  year: number;
  deposited: number;
  maturityValue: number;
}[] {
  const result = [];
  const years = Math.ceil(totalMonths / 12);
  for (let y = 1; y <= years; y++) {
    const m = Math.min(y * 12, totalMonths);
    const res = calcRD(monthlyAmount, R, m);
    result.push({ year: y, deposited: res.totalDeposited, maturityValue: res.maturityAmount });
  }
  return result;
}

// Popular RD rates (India 2025-26)
export const POPULAR_RD_RATES = [
  { bank: 'Post Office', rate: 6.7, label: 'Post Office RD' },
  { bank: 'SBI', rate: 6.5, label: 'SBI RD' },
  { bank: 'HDFC', rate: 7.0, label: 'HDFC Bank RD' },
  { bank: 'Senior Citizen', rate: 7.5, label: 'Senior Citizen RD' },
];
