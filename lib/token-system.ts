/**
 * PULSE Token System
 * 
 * PULSE Token Value Model:
 * - Initial value: 1 PULSE = 1 USDT
 * - Value increases with user growth and platform adoption
 * - Every new user signup increases token value
 * - Referral rewards create scarcity and increase demand
 * - Staking yields locked tokens
 * 
 * Formula: Token Value = Base Value × (1 + (Total Users / 1000))
 */

export const TOKEN_CONFIG = {
  SYMBOL: 'PULSE',
  BASE_CURRENCY: 'USDT',
  BASE_VALUE: 1.0, // 1 PULSE = 1 USDT initially
  TOTAL_SUPPLY: 10_000_000,
  
  // Distribution
  ADMIN_FLOAT: 3_500_000, // 35% - Admin/Platform operations
  USER_PROMOTIONS: 5_000_000, // 50% - User onboarding rewards
  P2P_AGENTS: 1_000_000, // 10% - P2P network agents
  RESERVE: 500_000, // 5% - Reserve fund
  
  // User onboarding
  SIGNUP_BONUS: 50, // USDT worth of PULSE
  
  // Tier bonuses
  TIER_BONUSES: {
    BRONZE: { min: 0, max: 999, bonus: 0 },
    SILVER: { min: 1000, max: 4999, bonus: 5 },
    GOLD: { min: 5000, max: 9999, bonus: 10 },
    PLATINUM: { min: 10000, max: 49999, bonus: 15 },
    DIAMOND: { min: 50000, max: Infinity, bonus: 20 },
  },
  
  // Staking yields (APY)
  STAKING_YIELDS: {
    BRONZE: 5,
    SILVER: 7,
    GOLD: 10,
    PLATINUM: 15,
    DIAMOND: 20,
  },
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  pulse_tokens_balance: number
  usd_balance: number
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'
  kyc_status: 'pending' | 'submitted' | 'verified' | 'rejected'
  approval_status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export class TokenSystem {
  /**
   * Calculate token value based on platform growth
   * Value increases 0.1% per 100 new users
   */
  static calculateTokenValue(totalUsers: number): number {
    const growthFactor = 1 + (totalUsers / 1000) * 0.001
    return TOKEN_CONFIG.BASE_VALUE * growthFactor
  }

  /**
   * Get user tier based on PULSE balance
   */
  static getUserTier(balance: number): keyof typeof TOKEN_CONFIG.TIER_BONUSES {
    const tiers = TOKEN_CONFIG.TIER_BONUSES
    
    if (balance >= tiers.DIAMOND.min) return 'DIAMOND'
    if (balance >= tiers.PLATINUM.min) return 'PLATINUM'
    if (balance >= tiers.GOLD.min) return 'GOLD'
    if (balance >= tiers.SILVER.min) return 'SILVER'
    return 'BRONZE'
  }

  /**
   * Calculate tier bonus percentage
   */
  static getTierBonus(tier: keyof typeof TOKEN_CONFIG.TIER_BONUSES): number {
    return TOKEN_CONFIG.TIER_BONUSES[tier].bonus
  }

  /**
   * Calculate total PULSE tokens for a purchase
   */
  static calculateTokenAllocation(usdAmount: number, userBalance: number): {
    baseTokens: number
    tierBonus: number
    totalTokens: number
    tier: string
  } {
    const baseTokens = usdAmount / TOKEN_CONFIG.BASE_VALUE
    const tier = this.getUserTier(userBalance)
    const tierBonusPercent = this.getTierBonus(tier)
    const tierBonus = (baseTokens * tierBonusPercent) / 100
    const totalTokens = baseTokens + tierBonus

    return {
      baseTokens,
      tierBonus,
      totalTokens,
      tier,
    }
  }

  /**
   * Calculate staking yield for a user
   */
  static calculateStakingYield(
    pulseBalance: number,
    stakedAmount: number,
    daysStaked: number
  ): {
    annualYield: number
    estimatedYield: number
    yieldPercentage: number
  } {
    const tier = this.getUserTier(pulseBalance)
    const yieldPercent = TOKEN_CONFIG.STAKING_YIELDS[tier]
    const annualYield = (stakedAmount * yieldPercent) / 100
    const estimatedYield = (annualYield * daysStaked) / 365

    return {
      annualYield,
      estimatedYield,
      yieldPercentage: yieldPercent,
    }
  }

  /**
   * Validate transaction amount
   */
  static validateTransaction(
    userBalance: number,
    amount: number,
    minAmount = 10,
    maxAmount = 100000
  ): { valid: boolean; error?: string } {
    if (amount < minAmount) {
      return {
        valid: false,
        error: `Minimum transaction amount is ${minAmount} USDT`,
      }
    }

    if (amount > maxAmount) {
      return {
        valid: false,
        error: `Maximum transaction amount is ${maxAmount} USDT`,
      }
    }

    if (userBalance < amount) {
      return {
        valid: false,
        error: `Insufficient balance. You have ${userBalance} USDT`,
      }
    }

    return { valid: true }
  }

  /**
   * Calculate referral rewards
   */
  static calculateReferralReward(
    referrerTier: keyof typeof TOKEN_CONFIG.TIER_BONUSES,
    referralPurchaseAmount: number
  ): number {
    const baseReward = (referralPurchaseAmount * 2) / 100 // 2% base
    const tierMultiplier = 1 + (TOKEN_CONFIG.TIER_BONUSES[referrerTier].bonus / 100)
    return baseReward * tierMultiplier
  }

  /**
   * Format currency display
   */
  static formatCurrency(amount: number, currency: 'USDT' | 'PULSE' = 'USDT'): string {
    if (currency === 'PULSE') {
      return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PULSE`
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  /**
   * Get tier color for UI
   */
  static getTierColor(
    tier: keyof typeof TOKEN_CONFIG.TIER_BONUSES
  ): string {
    const colors = {
      BRONZE: '#CD7F32',
      SILVER: '#C0C0C0',
      GOLD: '#FFD700',
      PLATINUM: '#E5E4E2',
      DIAMOND: '#B9F2FF',
    }
    return colors[tier]
  }

  /**
   * Get tier emoji for display
   */
  static getTierEmoji(tier: keyof typeof TOKEN_CONFIG.TIER_BONUSES): string {
    const emojis = {
      BRONZE: '🥉',
      SILVER: '🥈',
      GOLD: '🥇',
      PLATINUM: '💎',
      DIAMOND: '👑',
    }
    return emojis[tier]
  }
}

/**
 * Platform metrics for growth tracking
 */
export interface PlatformMetrics {
  totalUsers: number
  totalTransactionVolume: number
  totalTokensDistributed: number
  averageUserTier: string
  activeStakes: number
  stakedAmount: number
  currentTokenValue: number
  dailyActiveUsers: number
}

export const DEFAULT_METRICS: PlatformMetrics = {
  totalUsers: 1,
  totalTransactionVolume: 0,
  totalTokensDistributed: 50, // Initial signup bonus
  averageUserTier: 'BRONZE',
  activeStakes: 0,
  stakedAmount: 0,
  currentTokenValue: TOKEN_CONFIG.BASE_VALUE,
  dailyActiveUsers: 1,
}
