/**
 * ReturnX - FD (Fixed Deposit) Calculator Logic
 * Indian bank FD calculation with quarterly compounding
 */

export interface FDResult {
  maturityAmount: number;
  totalInterest: number;
  principal: number;
  rate: number;
  months: number;
  quarterlyCompounding: boolean;
  // Tax info
  tdsApplicable: boolean;
  tdsAmount: number;
  tdsThreshold: number;
  estimatedTax: number;
  postTaxInterest: number;
  postTaxMaturity: number;
}

export interface FDTaxOptions {
  taxRate?: number;
  seniorCitizen?: boolean;
}

/**
 * FD Maturity = P * (1 + r/n)^(n*t)
 * Indian banks: quarterly compounding (n=4)
 * @param P - Principal
 * @param R - Annual rate %
 * @param months - Tenure in months
 * @param quarterly - true for quarterly (default), false for monthly
 */
export function calcFD(P: number, R: number, months: number, quarterly: boolean = true, options: FDTaxOptions = {}): FDResult {
  const taxRate = options.taxRate ?? 0;
  const tdsThreshold = options.seniorCitizen ? 50000 : 40000;

  if (P <= 0 || months <= 0) {
    return {
      maturityAmount: P,
      totalInterest: 0,
      principal: P,
      rate: R,
      months,
      quarterlyCompounding: quarterly,
      tdsApplicable: false,
      tdsAmount: 0,
      tdsThreshold,
      estimatedTax: 0,
      postTaxInterest: 0,
      postTaxMaturity: P,
    };
  }

  const n = quarterly ? 4 : 12; // compounding frequency
  const t = months / 12; // in years
  const r = R / 100;

  let maturityAmount: number;
  if (R === 0) {
    maturityAmount = P;
  } else {
    maturityAmount = P * Math.pow(1 + r / n, n * t);
  }

  const totalInterest = maturityAmount - P;

  const tdsApplicable = totalInterest > tdsThreshold;
  const tdsAmount = tdsApplicable ? totalInterest * 0.1 : 0;
  const estimatedTax = totalInterest * (taxRate / 100);
  const postTaxInterest = totalInterest - estimatedTax;
  const postTaxMaturity = P + postTaxInterest;

  return {
    maturityAmount: Math.round(maturityAmount),
    totalInterest: Math.round(totalInterest),
    principal: P,
    rate: R,
    months,
    quarterlyCompounding: quarterly,
    tdsApplicable,
    tdsAmount: Math.round(tdsAmount),
    tdsThreshold,
    estimatedTax: Math.round(estimatedTax),
    postTaxInterest: Math.round(postTaxInterest),
    postTaxMaturity: Math.round(postTaxMaturity),
  };
}

/**
 * Yearly FD growth for chart
 */
export function calcFDYearWise(P: number, R: number, months: number): { year: number; amount: number; interest: number }[] {
  const n = 4;
  const r = R / 100;
  const years = Math.ceil(months / 12);
  const result = [];

  for (let y = 1; y <= years; y++) {
    const t = Math.min(y, months / 12);
    const amount = R > 0 ? P * Math.pow(1 + r / n, n * t) : P;
    result.push({ year: y, amount: Math.round(amount), interest: Math.round(amount - P) });
  }
  return result;
}

// Popular Indian FD rates 2025-26 (reference only)
export const POPULAR_FD_RATES = [
  { bank: 'SBI', rate: 7.0, label: 'SBI FD' },
  { bank: 'HDFC', rate: 7.4, label: 'HDFC Bank' },
  { bank: 'ICICI', rate: 7.25, label: 'ICICI Bank' },
  { bank: 'Post Office', rate: 7.5, label: 'Post Office TD' },
  { bank: 'Senior Citizen', rate: 7.75, label: 'Senior Citizen' },
];
