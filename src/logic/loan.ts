/**
 * ReturnX - Loan / EMI Calculation Logic
 * EMI, amortization schedule, and loan summary
 */

export interface EMIResult {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  principal: number;
  annualRate: number;
  months: number;
}

export interface AmortizationRow {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

/**
 * EMI Formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
 * @param P - Principal (loan amount)
 * @param R - Annual interest rate (percentage)
 * @param months - Loan tenure in months
 */
export function calcEMI(P: number, R: number, months: number): EMIResult {
  if (P <= 0 || months <= 0) {
    return { emi: 0, totalPayment: 0, totalInterest: 0, principal: P, annualRate: R, months };
  }
  if (R === 0) {
    const emi = P / months;
    return { emi: Math.round(emi), totalPayment: P, totalInterest: 0, principal: P, annualRate: 0, months };
  }

  const r = R / 100 / 12; // monthly rate
  const emi = (P * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - P;

  return {
    emi: Math.round(emi),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    principal: P,
    annualRate: R,
    months,
  };
}

/**
 * Full amortization schedule (reducing balance method)
 * Returns month-by-month breakdown
 */
export function calcAmortization(P: number, R: number, months: number): AmortizationRow[] {
  const result: AmortizationRow[] = [];
  const { emi } = calcEMI(P, R, months);
  if (emi === 0) return result;

  const r = R / 100 / 12;
  let balance = P;

  for (let m = 1; m <= months; m++) {
    const interestComponent = R > 0 ? Math.round(balance * r) : 0;
    const principalComponent = Math.round(emi - interestComponent);
    balance = Math.max(0, Math.round(balance - principalComponent));

    result.push({
      month: m,
      emi: Math.round(emi),
      principal: principalComponent,
      interest: interestComponent,
      balance,
    });

    if (balance === 0) break;
  }

  return result;
}

/**
 * Yearly summary of amortization (for charts)
 */
export function calcAmortizationYearly(P: number, R: number, months: number): {
  year: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
}[] {
  const schedule = calcAmortization(P, R, months);
  const yearlyMap: Record<number, { principalPaid: number; interestPaid: number; balance: number }> = {};

  schedule.forEach((row) => {
    const year = Math.ceil(row.month / 12);
    if (!yearlyMap[year]) {
      yearlyMap[year] = { principalPaid: 0, interestPaid: 0, balance: 0 };
    }
    yearlyMap[year].principalPaid += row.principal;
    yearlyMap[year].interestPaid += row.interest;
    yearlyMap[year].balance = row.balance;
  });

  return Object.entries(yearlyMap).map(([year, data]) => ({
    year: Number(year),
    ...data,
  }));
}

// Dev test
// const emi = calcEMI(5000000, 8.5, 240);
// console.log('EMI Test (50L, 8.5%, 20yr):', emi);
// Expected EMI: ~43,391
