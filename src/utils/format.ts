/**
 * ReturnX - Number & Currency Formatting Utilities
 * Indian number format with ₹ symbol
 */

/**
 * Format a number in Indian style: ₹ 1,00,000
 * @param amount - Number to format
 * @param showSymbol - Whether to prepend ₹
 * @param decimals - Decimal places (default 0)
 */
export function formatINR(amount: number, showSymbol: boolean = true, decimals: number = 0): string {
  if (isNaN(amount) || !isFinite(amount)) return showSymbol ? '₹ 0' : '0';

  const rounded = Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals);
  const isNegative = rounded < 0;
  const absValue = Math.abs(rounded);

  // Indian number formatting: last 3 digits, then groups of 2
  const parts = absValue.toFixed(decimals).split('.');
  const intPart = parts[0];
  const decPart = parts[1];

  let formatted = '';
  const len = intPart.length;

  if (len <= 3) {
    formatted = intPart;
  } else {
    // Last 3 digits
    formatted = intPart.slice(-3);
    let remaining = intPart.slice(0, -3);
    while (remaining.length > 0) {
      formatted = remaining.slice(-2) + ',' + formatted;
      remaining = remaining.slice(0, -2);
    }
    // Remove leading comma if first group had 1 digit
    if (formatted.startsWith(',')) {
      formatted = formatted.slice(1);
    }
  }

  if (decPart && decimals > 0) {
    formatted += '.' + decPart;
  }

  const sign = isNegative ? '-' : '';
  const symbol = showSymbol ? '₹ ' : '';
  return `${sign}${symbol}${formatted}`;
}

/**
 * Format large amounts with suffix: ₹ 12.5L, ₹ 2.3Cr
 */
export function formatINRShort(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return '₹ 0';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 1_00_00_000) {
    // Crore
    return `${sign}₹ ${(abs / 1_00_00_000).toFixed(2)}Cr`;
  } else if (abs >= 1_00_000) {
    // Lakh
    return `${sign}₹ ${(abs / 1_00_000).toFixed(2)}L`;
  } else if (abs >= 1_000) {
    return `${sign}₹ ${(abs / 1_000).toFixed(1)}K`;
  }
  return `${sign}₹ ${Math.round(abs)}`;
}

/**
 * Parse a formatted INR string back to number
 */
export function parseINR(value: string): number {
  const cleaned = value.replace(/[₹,\s]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format number with commas (Indian style) — no ₹
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return formatINR(value, false, decimals);
}

/**
 * Parse raw input string to number safely
 */
export function parseInput(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Validate if a value is a safe positive number for calculation
 */
export function isValidInput(value: number): boolean {
  return value > 0 && isFinite(value) && !isNaN(value);
}
