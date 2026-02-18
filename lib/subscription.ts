import { createClient } from '@/lib/supabase/server'

export interface SubscriptionLimits {
  tradesPerMonth: number
  aiAnalysesPerMonth: number
  propFirmChallenges: number
  features: {
    autoSync: boolean
    studyMaterials: boolean
    advancedAnalytics: boolean
  }
}

export const TIER_LIMITS: Record<string, SubscriptionLimits> = {
  free: {
    tradesPerMonth: 10,
    aiAnalysesPerMonth: 10,
    propFirmChallenges: 1,
    features: {
      autoSync: false,
      studyMaterials: false,
      advancedAnalytics: false,
    },
  },
  pro: {
    tradesPerMonth: -1, // unlimited
    aiAnalysesPerMonth: -1, // unlimited
    propFirmChallenges: 1,
    features: {
      autoSync: false,
      studyMaterials: false,
      advancedAnalytics: true,
    },
  },
  premium: {
    tradesPerMonth: -1, // unlimited
    aiAnalysesPerMonth: -1, // unlimited
    propFirmChallenges: 5,
    features: {
      autoSync: true,
      studyMaterials: true,
      advancedAnalytics: true,
    },
  },
}

export async function checkSubscriptionLimit(
  userId: string,
  limitType: 'trades' | 'analyses' | 'propFirms'
): Promise<{
  allowed: boolean
  current: number
  limit: number
  tier: string
}> {
  const supabase = await createClient()

  // Get user's subscription tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single()

  const tier = profile?.subscription_tier || 'free'
  const limits = TIER_LIMITS[tier]

  // Calculate current usage this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  let current = 0

  if (limitType === 'trades') {
    const limit = limits.tradesPerMonth
    if (limit === -1) {
      return { allowed: true, current: 0, limit: -1, tier }
    }

    const { count } = await supabase
      .from('trades')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString())

    current = count || 0
    return {
      allowed: current < limit,
      current,
      limit,
      tier,
    }
  }

  if (limitType === 'analyses') {
    const limit = limits.aiAnalysesPerMonth
    if (limit === -1) {
      return { allowed: true, current: 0, limit: -1, tier }
    }

    const { count } = await supabase
      .from('trades')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('ai_analysis', 'is', null)
      .gte('created_at', startOfMonth.toISOString())

    current = count || 0
    return {
      allowed: current < limit,
      current,
      limit,
      tier,
    }
  }

  if (limitType === 'propFirms') {
    const limit = limits.propFirmChallenges

    const { count } = await supabase
      .from('prop_firm_challenges')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active')

    current = count || 0
    return {
      allowed: current < limit,
      current,
      limit,
      tier,
    }
  }

  return { allowed: true, current: 0, limit: -1, tier }
}

export async function getUserUsageStats(userId: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single()

  const tier = profile?.subscription_tier || 'free'
  const limits = TIER_LIMITS[tier]

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  // Count trades this month
  const { count: tradesCount } = await supabase
    .from('trades')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString())

  // Count AI analyses this month
  const { count: analysesCount } = await supabase
    .from('trades')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('ai_analysis', 'is', null)
    .gte('created_at', startOfMonth.toISOString())

  // Count active prop firms
  const { count: propFirmsCount } = await supabase
    .from('prop_firm_challenges')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'active')

  return {
    tier,
    trades: {
      current: tradesCount || 0,
      limit: limits.tradesPerMonth,
      percentage: limits.tradesPerMonth === -1
        ? 0
        : ((tradesCount || 0) / limits.tradesPerMonth) * 100,
    },
    analyses: {
      current: analysesCount || 0,
      limit: limits.aiAnalysesPerMonth,
      percentage: limits.aiAnalysesPerMonth === -1
        ? 0
        : ((analysesCount || 0) / limits.aiAnalysesPerMonth) * 100,
    },
    propFirms: {
      current: propFirmsCount || 0,
      limit: limits.propFirmChallenges,
    },
    features: limits.features,
  }
}