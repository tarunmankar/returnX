/**
 * Logic for SBI Annuity Deposit Scheme
 * Deposits a lump sum and receives a fixed monthly EMI-style payout.
 */

export function calcSBIAnnuity(principal: number, rate: number, years: number) {
  // Monthly interest rate
  const r = rate / 12 / 100;
  // Total months
  const n = years * 12;

  // EMI formula (used in reverse for annuity payout)
  // Payout = P * r * (1+r)^n / ((1+r)^n - 1)
  let monthlyPayout = 0;
  if (r === 0) {
    monthlyPayout = principal / n;
  } else {
    monthlyPayout = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  }

  const totalPayout = monthlyPayout * n;
  const totalInterest = totalPayout - principal;

  return {
    principal,
    monthlyPayout,
    totalInterest,
    totalReturns: totalPayout,
  };
}
