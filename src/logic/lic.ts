/**
 * Logic for LIC Endowment Plans
 * Covers: Jeevan Utsav (Plan 871) & Jeevan Umang (Plan 945)
 *
 * Key Feature: After premium-paying term ends, LIC pays 10% of Sum Assured
 * as a "Survival Benefit" every year for LIFE. Death benefit is paid additionally.
 *
 * Note: LIC does not publish exact internal rates (IRR). This calculator
 * helps users understand the cash flow and approximate yield.
 */

export type LICPlan = 'jeevan_utsav' | 'jeevan_umang';

export interface LICResult {
  plan: LICPlan;
  sumAssured: number;
  premiumPayingTerm: number;
  yearlySurvivalBenefit: number; // 10% of SA, paid every year for life
  monthlySurvivalBenefit: number;
  totalPremiumPaid: number;       // Approximate (user provides annual premium estimate)
  // Projection over a life expectancy window
  breakEvenYear: number;          // Year when total survival benefits = total premiums paid
  projectionRows: LICProjectionRow[];
}

export interface LICProjectionRow {
  year: number;
  survivalBenefit: number;        // 10% of SA received that year
  cumulativeBenefit: number;      // Total received so far
  cumulativePremium: number;      // Total premium paid so far
  netPosition: number;            // cumBenefit - cumPremium
}

/**
 * Calculates LIC Jeevan Utsav / Jeevan Umang cash flows.
 *
 * @param sumAssured      - Sum Assured (Bima Rashi) chosen
 * @param annualPremium   - Estimated annual premium the user pays
 * @param premiumTerm     - Number of years premium is paid (e.g., 5, 10, 15)
 * @param projectionYears - Total years to project (e.g., 30 = age 30 to 60 if started at 30)
 */
export function calcLIC(
  sumAssured: number,
  annualPremium: number,
  premiumTerm: number,
  projectionYears: number = 30
): LICResult {
  const yearlySurvivalBenefit = sumAssured * 0.10; // 10% of SA, every year after premium term
  const monthlySurvivalBenefit = yearlySurvivalBenefit / 12;
  const totalPremiumPaid = annualPremium * premiumTerm;

  const projectionRows: LICProjectionRow[] = [];
  let cumulativeBenefit = 0;
  let breakEvenYear = 0;
  let breakEvenFound = false;

  for (let year = 1; year <= projectionYears; year++) {
    const cumulativePremium = year <= premiumTerm
      ? annualPremium * year
      : totalPremiumPaid;

    const benefit = year > premiumTerm ? yearlySurvivalBenefit : 0;
    cumulativeBenefit += benefit;

    const netPosition = cumulativeBenefit - cumulativePremium;

    if (!breakEvenFound && netPosition >= 0) {
      breakEvenYear = year;
      breakEvenFound = true;
    }

    projectionRows.push({
      year,
      survivalBenefit: benefit,
      cumulativeBenefit,
      cumulativePremium,
      netPosition,
    });
  }

  return {
    plan: 'jeevan_utsav',
    sumAssured,
    premiumPayingTerm: premiumTerm,
    yearlySurvivalBenefit,
    monthlySurvivalBenefit,
    totalPremiumPaid,
    breakEvenYear,
    projectionRows,
  };
}
