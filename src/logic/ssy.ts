/**
 * Logic for Sukanya Samriddhi Yojana (SSY)
 * 2026 Policy:
 * - 8.2% p.a. (compounded yearly)
 * - Max deposit: ₹1.5 Lakh/year
 * - Deposit tenure: 15 years
 * - Maturity: 21 years from opening (earns interest for the final 6 years without new deposits)
 */

export function calcSSY(yearlyDeposit: number, rate: number = 8.2) {
  let balance = 0;
  let totalDeposited = 0;
  const yearlyData = [];
  const r = rate / 100;

  // 21 years total tenure
  for (let year = 1; year <= 21; year++) {
    const depositThisYear = year <= 15 ? yearlyDeposit : 0;
    totalDeposited += depositThisYear;
    
    // Deposit happens across the year, but standard SSY formula assumes yearly compounding.
    // Interest is calculated on the lowest balance between 5th and end of the month, 
    // but a yearly approximation is generally used for calculators.
    // Approximation: Deposit added at the start of the year.
    balance += depositThisYear;
    const interestEarned = balance * r;
    balance += interestEarned;

    yearlyData.push({
      year,
      deposit: depositThisYear,
      interest: interestEarned,
      closingBalance: balance
    });
  }

  const totalInterest = balance - totalDeposited;

  return {
    yearlyDeposit,
    totalDeposited,
    totalInterest,
    maturityAmount: balance,
    yearlyData
  };
}
