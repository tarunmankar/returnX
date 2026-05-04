const fs = require('fs');
const path = require('path');
const dir = 'src/screens';

const labels = {
  loanAmount: 'Loan Amount',
  loanRate: 'Loan Interest Rate',
  loanMonths: 'Loan Tenure (Months)',
  investRate: 'Expected Return Rate',
  principal: 'Deposit Amount',
  rate: 'Interest Rate',
  years: 'Tenure (Years)',
  tenure: 'Tenure (Years)',
  amount: 'Investment Amount',
  months: 'Duration (Months)',
  sumAssured: 'Sum Assured (Bima Rashi)',
  annualPremium: 'Annual Premium',
  premiumTerm: 'Premium Paying Term (Years)',
  annual: 'Annual Investment Amount',
  monthly: 'Monthly Investment',
  yearlyDeposit: 'Yearly Investment'
};

const screens = fs.readdirSync(dir).filter(f => f.endsWith('Screen.tsx'));
let fixed = 0;

for (const f of screens) {
  const fp = path.join(dir, f);
  let c = fs.readFileSync(fp, 'utf8');
  let changed = false;

  // Fix InputCards
  c = c.replace(/^\s*=\{([a-zA-Z0-9_]+)\}\s+onChangeText=/gm, (match, v) => {
    changed = true;
    const label = labels[v] || 'Input Value';
    return `          <InputCard\n            label="${label}"\n            defaultValue={${v}}\n            onChangeText=`;
  });

  // Fix RateBanners
  c = c.replace(/^\s*=\{([a-zA-Z0-9_]+)\}\s+onRateChange=/gm, (match, v) => {
    changed = true;
    return `        <RateBanner\n          defaultRate={${v}}\n          onRateChange=`;
  });

  if (changed) {
    fs.writeFileSync(fp, c);
    console.log('Repaired: ' + f);
    fixed++;
  }
}

console.log('Fixed ' + fixed + ' files.');
