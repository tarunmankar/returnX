/**
 * ReturnX - PPF (Public Provident Fund) Calculator Logic
 * Government of India scheme - Tax-free, 15 year lock-in
 */

export interface PPFResult {
  maturityAmount: number;
  totalInvested: number;
  totalInterest: number;
  annualAmount: number;
  rate: number;
  years: number;
  taxSaved: number; // Under Section 80C @ 30% slab (reference only)
  isEEE: boolean; // Exempt-Exempt-Exempt tax status
}

export interface PPFYearlyRow {
  year: number;
  openingBalance: number;
  contribution: number;
  interest: number;
  closingBalance: number;
  cumulativeInvested: number;
}

/**
 * PPF calculation (annual contribution, annual compounding)
 * FV = P * [(1+r)^n - 1] / r * (1+r)
 * Interest is credited on minimum balance between 5th and last day of month
 * Simplified: Annual end-of-year contribution
 *
 * @param annualAmount - Annual contribution (max ₹1.5 lakh)
 * @param R - Annual rate % (current: 7.1%)
 * @param years - Investment tenure (min 15, extendable by 5)
 */
export function calcPPF(annualAmount: number, R: number, years: number): PPFResult {
  const maxAnnual = 150000; // ₹1.5 lakh limit
  const P = Math.min(annualAmount, maxAnnual);

  if (P <= 0 || years < 1) {
    return { maturityAmount: 0, totalInvested: 0, totalInterest: 0, annualAmount: P, rate: R, years, taxSaved: 0, isEEE: true };
  }

  const r = R / 100;
  // PPF: investment at start of year (beginning of period)
  const maturityAmount = R > 0
    ? P * ((Math.pow(1 + r, years) - 1) / r) * (1 + r)
    : P * years;

  const totalInvested = P * years;
  const totalInterest = maturityAmount - totalInvested;

  // Tax saved: 30% slab on ₹1.5L = ₹46,350/year (indicative only)
  const taxSaved = Math.min(P, 150000) * 0.30 * years;

  return {
    maturityAmount: Math.round(maturityAmount),
    totalInvested: Math.round(totalInvested),
    totalInterest: Math.round(totalInterest),
    annualAmount: P,
    rate: R,
    years,
    taxSaved: Math.round(taxSaved),
    isEEE: true,
  };
}

/**
 * PPF year-by-year breakdown
 */
export function calcPPFYearWise(annualAmount: number, R: number, years: number): PPFYearlyRow[] {
  const P = Math.min(annualAmount, 150000);
  const r = R / 100;
  const result: PPFYearlyRow[] = [];
  let balance = 0;

  for (let y = 1; y <= years; y++) {
    const openingBalance = balance;
    const contribution = P;
    // Interest on (opening balance + contribution) at year start
    const interest = R > 0 ? Math.round((openingBalance + contribution) * r) : 0;
    balance = openingBalance + contribution + interest;

    result.push({
      year: y,
      openingBalance: Math.round(openingBalance),
      contribution,
      interest,
      closingBalance: Math.round(balance),
      cumulativeInvested: P * y,
    });
  }

  return result;
}

// PPF current government rate
export const PPF_CURRENT_RATE = 7.1;
export const PPF_MAX_ANNUAL = 150000;
export const PPF_MIN_TENURE = 15;
