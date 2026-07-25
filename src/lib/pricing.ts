/**
 * PropertyBD Dynamic Pricing System
 *
 * Model A — Free listing (seller দেয় না):
 *   Buyer pays to unlock number
 *   ≤ ২০ লাখ  → ৳২০
 *   প্রতি লাখ বাড়লে → +৳১
 *   Formula: 20 + max(0, floor((price - 2000000) / 100000))
 *
 * Model B — Paid listing (seller pays to show number publicly):
 *   Number shown freely to all buyers
 *   ≤ ২০ লাখ  → ৳৪০ (seller pays once)
 *   প্রতি লাখ বাড়লে → +৳২
 *   Formula: 40 + max(0, floor((price - 2000000) / 100000) * 2)
 */

/**
 * Calculate buyer's unlock fee for a free listing
 * @param price - Property/vehicle price in BDT
 * @returns Unlock fee in BDT (minimum ৳২০)
 */
export function calculateUnlockFee(price: number): number {
  if (price <= 0) return 20
  if (price <= 2_000_000) return 20 // ২০ লাখ বা তার নিচে

  const extraLakhs = Math.floor((price - 2_000_000) / 100_000)
  return 20 + extraLakhs
}

/**
 * Calculate seller's paid listing fee (to show number publicly)
 * @param price - Property/vehicle price in BDT
 * @returns Listing fee in BDT (minimum ৳৪০)
 */
export function calculatePaidListingFee(price: number): number {
  if (price <= 0) return 40
  if (price <= 2_000_000) return 40 // ২০ লাখ বা তার নিচে

  const extraLakhs = Math.floor((price - 2_000_000) / 100_000)
  return 40 + extraLakhs * 2
}

/**
 * Format price in Bengali readable format
 * e.g. 2500000 → "২৫ লাখ"
 */
export function formatPriceBn(price: number): string {
  if (price >= 10_000_000) {
    const crore = price / 10_000_000
    return `${crore % 1 === 0 ? crore : crore.toFixed(1)} কোটি`
  }
  if (price >= 100_000) {
    const lakh = price / 100_000
    return `${lakh % 1 === 0 ? lakh : lakh.toFixed(1)} লাখ`
  }
  if (price >= 1_000) {
    const hazar = price / 1_000
    return `${hazar % 1 === 0 ? hazar : hazar.toFixed(1)} হাজার`
  }
  return `${price}`
}

/**
 * Get pricing breakdown for display
 */
export function getPricingBreakdown(price: number) {
  const unlockFee = calculateUnlockFee(price)
  const paidListingFee = calculatePaidListingFee(price)

  return {
    unlockFee,
    paidListingFee,
    unlockFeeDisplay: `৳${unlockFee}`,
    paidListingFeeDisplay: `৳${paidListingFee}`,
    isBaseFee: price <= 2_000_000,
  }
}

// Example fee table for reference
export const FEE_EXAMPLES = [
  { priceLabel: '১০ লাখ', price: 1_000_000, unlock: 20, paid: 40 },
  { priceLabel: '২০ লাখ', price: 2_000_000, unlock: 20, paid: 40 },
  { priceLabel: '৩০ লাখ', price: 3_000_000, unlock: 30, paid: 60 },
  { priceLabel: '৫০ লাখ', price: 5_000_000, unlock: 50, paid: 100 },
  { priceLabel: '১ কোটি', price: 10_000_000, unlock: 100, paid: 200 },
  { priceLabel: '২ কোটি', price: 20_000_000, unlock: 200, paid: 400 },
]
