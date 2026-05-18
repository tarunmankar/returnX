/**
 * Logic for Post Office Monthly Income Scheme (POMIS)
 * 2026 Policy:
 * - 7.4% p.a.
 * - 5 years tenure
 * - Monthly payouts
 */

export function calcPOMIS(principal: number, rate: number = 7.4, taxRate: number = 0) {
  // Monthly Payout = (P * R) / 1200
  const monthlyPayout = (principal * rate) / 1200;
  const totalPayoutsIn5Years = monthlyPayout * 12 * 5;
  const estimatedTax = totalPayoutsIn5Years * (taxRate / 100);
  const postTaxInterest = totalPayoutsIn5Years - estimatedTax;

  return {
    principal,
    monthlyPayout,
    postTaxMonthlyPayout: monthlyPayout * (1 - taxRate / 100),
    totalInterestEarned: totalPayoutsIn5Years,
    estimatedTax,
    postTaxInterest,
    totalReturns: principal + totalPayoutsIn5Years,
    postTaxReturns: principal + postTaxInterest,
  };
}
