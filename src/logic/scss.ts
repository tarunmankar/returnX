/**
 * Logic for Senior Citizen Savings Scheme (SCSS)
 * 2026 Policy:
 * - 8.2% p.a.
 * - 5 years tenure
 * - Quarterly payouts
 */

export function calcSCSS(principal: number, rate: number = 8.2, taxRate: number = 0) {
  // Quarterly Payout = (P * R) / 400
  const quarterlyPayout = (principal * rate) / 400;
  const totalPayoutsIn5Years = quarterlyPayout * 4 * 5;
  const estimatedTax = totalPayoutsIn5Years * (taxRate / 100);
  const postTaxInterest = totalPayoutsIn5Years - estimatedTax;

  return {
    principal,
    quarterlyPayout,
    postTaxQuarterlyPayout: quarterlyPayout * (1 - taxRate / 100),
    totalInterestEarned: totalPayoutsIn5Years,
    estimatedTax,
    postTaxInterest,
    totalReturns: principal + totalPayoutsIn5Years,
    postTaxReturns: principal + postTaxInterest,
  };
}
