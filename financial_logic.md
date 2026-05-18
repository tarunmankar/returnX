# Financial Calculators Business Logic

This document contains the core mathematical logic and formulas for various financial calculators used in the **ReturnX** application. You can use this logic to build your new website.

---

## 1. Simple Interest (SI)
**Formula:** `SI = (P * R * T) / 100`
- **P**: Principal amount
- **R**: Annual interest rate (%)
- **T**: Time in years

**Logic:**
```javascript
function calcSimpleInterest(P, R, T) {
  const interest = (P * R * T) / 100;
  const totalAmount = P + interest;
  return { interest, totalAmount };
}
```

---

## 2. Compound Interest (Lump Sum)
**Formula:** `A = P * (1 + R / (100 * n)) ^ (n * T)`
- **n**: Compounding frequency (12 for monthly, 4 for quarterly, 1 for yearly)

**Logic:**
```javascript
function calcCompoundInterest(P, R, T, n = 12) {
  const totalAmount = P * Math.pow(1 + (R / 100) / n, n * T);
  const interest = totalAmount - P;
  return { interest, totalAmount };
}
```

---

## 3. SIP (Systematic Investment Plan)
**Formula:** `FV = P * [((1 + r)^n - 1) / r] * (1 + r)`
- **P**: Monthly SIP amount
- **r**: Monthly interest rate (`Annual Rate / 100 / 12`)
- **n**: Total number of months (`Years * 12`)

**Logic:**
```javascript
function calcSIP(P, R, T) {
  const r = R / 100 / 12;
  const n = T * 12;
  const futureValue = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const totalInvested = P * n;
  const totalReturns = futureValue - totalInvested;
  return { futureValue, totalInvested, totalReturns };
}
```

---

## 4. Loan / EMI (Equated Monthly Installment)
**Formula:** `EMI = [P * r * (1 + r)^n] / [((1 + r)^n) - 1]`
- **P**: Loan amount
- **r**: Monthly interest rate (`Annual Rate / 100 / 12`)
- **n**: Tenure in months

**Logic:**
```javascript
function calcEMI(P, R, months) {
  const r = R / 100 / 12;
  const emi = (P * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - P;
  return { emi, totalPayment, totalInterest };
}
```

---

## 5. Fixed Deposit (FD)
In India, FD is usually compounded **quarterly**.
**Formula:** `A = P * (1 + r / 4) ^ (4 * T)`
- **T**: Tenure in years (`Months / 12`)

**Logic:**
```javascript
function calcFD(P, R, months) {
  const n = 4; // Quarterly compounding
  const t = months / 12;
  const r = R / 100;
  const maturityAmount = P * Math.pow(1 + r / n, n * t);
  const totalInterest = maturityAmount - P;
  return { maturityAmount, totalInterest };
}
```

---

## 6. PPF (Public Provident Fund)
PPF is a long-term scheme (15 years) where interest is compounded **annually**.
**Formula:** `FV = P * [((1 + r)^n - 1) / r] * (1 + r)` (Assuming investment at start of year)

**Logic:**
```javascript
function calcPPF(annualAmount, rate, years) {
  const r = rate / 100;
  const maturityAmount = annualAmount * ((Math.pow(1 + r, years) - 1) / r) * (1 + r);
  const totalInvested = annualAmount * years;
  return { maturityAmount, totalInvested, totalInterest: maturityAmount - totalInvested };
}
```

---

## 7. Sukanya Samriddhi Yojana (SSY)
- **Deposit Term**: 15 years
- **Maturity Term**: 21 years
- **Interest**: Compounded annually (even for the 6 years after deposit term ends)

**Logic:**
```javascript
function calcSSY(yearlyDeposit, rate = 8.2) {
  let balance = 0;
  let totalDeposited = 0;
  const r = rate / 100;

  for (let year = 1; year <= 21; year++) {
    const deposit = year <= 15 ? yearlyDeposit : 0;
    totalDeposited += deposit;
    balance += deposit;
    balance += (balance * r); // Yearly compounding
  }
  return { maturityAmount: balance, totalDeposited, totalInterest: balance - totalDeposited };
}
```

---

## 8. Recurring Deposit (RD)
RD interest is usually compounded **quarterly** in India.

**Logic:**
```javascript
function calcRD(monthlyAmount, rate, months) {
  const rq = rate / 400; // Quarterly rate
  let maturity = 0;
  for (let m = 1; m <= months; m++) {
    const quartersRemaining = (months - m + 1) / 3;
    maturity += monthlyAmount * Math.pow(1 + rq, quartersRemaining);
  }
  return { maturityAmount: Math.round(maturity), totalDeposited: monthlyAmount * months };
}
```

---

## 9. NSC (National Savings Certificate)
- **Tenure**: 5 years fixed
- **Compounding**: Annual

**Logic:**
```javascript
function calcNSC(principal, rate = 7.7) {
  const r = rate / 100;
  const maturityAmount = principal * Math.pow(1 + r, 5);
  return { maturityAmount, totalInterest: maturityAmount - principal };
}
```

---

## 10. POMIS (Post Office Monthly Income Scheme)
Provides monthly payouts; principal is returned at the end of 5 years.

**Logic:**
```javascript
function calcPOMIS(principal, rate = 7.4) {
  const monthlyPayout = (principal * rate) / 1200;
  const totalInterest = monthlyPayout * 12 * 5;
  return { monthlyPayout, totalInterest, totalReturns: principal + totalInterest };
}
```

---

## 11. Senior Citizen Savings Scheme (SCSS)
- **Tenure**: 5 years
- **Payout**: Quarterly interest payouts

**Logic:**
```javascript
function calcSCSS(principal, rate = 8.2) {
  const quarterlyPayout = (principal * rate) / 400;
  const totalInterest = quarterlyPayout * 4 * 5;
  return { quarterlyPayout, totalInterest, totalReturns: principal + totalInterest };
}
```

---

## 12. SBI Annuity Deposit Scheme
Deposits a lump sum and receives a fixed monthly EMI-style payout (Principal + Interest).

**Logic:**
```javascript
function calcSBIAnnuity(principal, rate, years) {
  const r = rate / 12 / 100;
  const n = years * 12;
  const monthlyPayout = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  const totalReturns = monthlyPayout * n;
  return { monthlyPayout, totalReturns, totalInterest: totalReturns - principal };
}
```

---

## 13. Stock Profit/Loss Calculator
Basic logic for calculating returns on stocks.

**Logic:**
```javascript
function calcStockProfit(buyPrice, sellPrice, quantity) {
  const totalInvested = buyPrice * quantity;
  const totalValue = sellPrice * quantity;
  const profitLoss = totalValue - totalInvested;
  const returnPercent = (profitLoss / totalInvested) * 100;
  return { totalInvested, totalValue, profitLoss, returnPercent };
}
```

---

## Summary of Key Formulas

| Calculator | Formula Type | Default Compounding |
| :--- | :--- | :--- |
| **SIP** | Annuity (Beginning of period) | Monthly |
| **FD** | Lump Sum Compound | Quarterly |
| **RD** | Recurring Annuity | Quarterly |
| **Loan/EMI** | Reducing Balance | Monthly |
| **PPF** | Annual Annuity | Yearly |
| **NSC** | Lump Sum Compound | Yearly |
| **SSY** | Annual Annuity (15yr) + 6yr Growth | Yearly |
| **Lump Sum** | Basic Compound | Monthly/Quarterly |

---

> [!TIP]
> Always use `Math.round()` for currency values to avoid decimal issues in UI.
