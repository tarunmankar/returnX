export function calcStockProfit(buyPrice: number, sellPrice: number, quantity: number) {
  const totalInvested = buyPrice * quantity;
  const totalValue = sellPrice * quantity;
  const profitLoss = totalValue - totalInvested;
  const isProfit = profitLoss >= 0;
  
  let returnPercent = 0;
  if (totalInvested > 0) {
    returnPercent = (profitLoss / totalInvested) * 100;
  }

  return {
    totalInvested,
    totalValue,
    profitLoss,
    returnPercent,
    isProfit,
  };
}
