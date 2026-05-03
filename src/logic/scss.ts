/**
 * Logic for Senior Citizen Savings Scheme (SCSS)
 * 2026 Policy:
 * - 8.2% p.a.
 * - 5 years tenure
 * - Quarterly payouts
 */

export function calcSCSS(principal: number, rate: number = 8.2) {
  // Quarterly Payout = (P * R) / 400
  const quarterlyPayout = (principal * rate) / 400;
  const totalPayoutsIn5Years = quarterlyPayout * 4 * 5;

  return {
    principal,
    quarterlyPayout,
    totalInterestEarned: totalPayoutsIn5Years,
    totalReturns: principal + totalPayoutsIn5Years,
  };
}
