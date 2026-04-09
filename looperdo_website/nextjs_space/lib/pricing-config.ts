export const PRICING_CONFIG = {
  IN: { 
    currency: '₹',
    PRO: { monthly: 999, yearly: 9999 },
    ALL_ACCESS: { monthly: 1499, yearly: 14999 },
    gateway: 'razorpay'
  },
  US: { 
    currency: '$',
    PRO: { monthly: 29, yearly: 290 },
    ALL_ACCESS: { monthly: 49, yearly: 490 },
    gateway: 'stripe'
  },
  ROW: { // Rest of World (PPP Discounted)
    currency: '$',
    PRO: { monthly: 15, yearly: 150 },
    ALL_ACCESS: { monthly: 25, yearly: 250 },
    gateway: 'stripe'
  }
};