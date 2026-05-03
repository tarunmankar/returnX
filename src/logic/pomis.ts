/**
 * Logic for Post Office Monthly Income Scheme (POMIS)
 * 2026 Policy:
 * - 7.4% p.a.
 * - 5 years tenure
 * - Monthly payouts
 */

export function calcPOMIS(principal: number, rate: number = 7.4) {
  // Monthly Payout = (P * R) / 1200
  const monthlyPayout = (principal * rate) / 1200;
  const totalPayoutsIn5Years = monthlyPayout * 12 * 5;

  return {
    principal,
    monthlyPayout,
    totalInterestEarned: totalPayoutsIn5Years,
    totalReturns: principal + totalPayoutsIn5Years,
  };
}
