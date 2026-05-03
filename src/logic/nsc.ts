/**
 * Logic for National Savings Certificate (NSC)
 * 2026 Policy:
 * - 7.7% p.a. compounded annually
 * - 5 years tenure lock-in
 * - Lump sum deposit
 */

export function calcNSC(principal: number, rate: number = 7.7) {
  const years = 5;
  const r = rate / 100;
  
  let balance = principal;
  const yearlyData = [];

  for (let year = 1; year <= years; year++) {
    const interestThisYear = balance * r;
    balance += interestThisYear;
    
    yearlyData.push({
      year,
      interest: interestThisYear,
      closingBalance: balance
    });
  }

  const totalInterest = balance - principal;

  return {
    principal,
    totalInterest,
    maturityAmount: balance,
    yearlyData
  };
}
