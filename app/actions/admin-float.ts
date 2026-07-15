'use server'

import { serviceClient } from '@/lib/pulse/service'
import { revalidateTag } from 'next/cache'

export async function getAdminFloat(adminId: string) {
  try {
    const db = serviceClient()
    const { data, error } = await db
      .from('admin_float')
      .select('*')
      .eq('admin_id', adminId)
      .maybeSingle()

    if (error) {
      console.error('[v0] Error fetching admin float:', error)
      return null
    }

    if (!data) {
      return await createAdminFloat(adminId)
    }

    return data
  } catch (err) {
    console.error('[v0] Exception in getAdminFloat:', err)
    return null
  }
}

async function createAdminFloat(adminId: string) {
  try {
    const db = serviceClient()
    const { data, error } = await db
      .from('admin_float')
      .insert({
        admin_id: adminId,
        pulse_tokens_balance: 2000000,
        usd_balance: 1000000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Error creating admin float:', error)
      return null
    }
    return data
  } catch (err) {
    console.error('[v0] Exception in createAdminFloat:', err)
    return null
  }
}

export async function topUpAdminFloat(adminId: string, usdAmount: number = 0, pulseAmount: number = 0) {
  try {
    const db = serviceClient()
    const float = await getAdminFloat(adminId)

    if (!float) {
      return { ok: false, error: 'Admin float not found' }
    }

    const { data, error } = await db
      .from('admin_float')
      .update({
        pulse_tokens_balance: float.pulse_tokens_balance + pulseAmount,
        usd_balance: float.usd_balance + usdAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('admin_id', adminId)
      .select()
      .single()

    if (error) {
      return { ok: false, error: error.message }
    }

    revalidateTag(`admin-float-${adminId}`)
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

export async function allocateFloatToUser(adminId: string, userId: string, pulseAmount: number, usdAmount: number) {
  try {
    const db = serviceClient()

    // Check admin float
    const adminFloat = await getAdminFloat(adminId)
    if (!adminFloat) {
      return { ok: false, error: 'Admin float not found' }
    }

    if (adminFloat.pulse_tokens_balance < pulseAmount) {
      return { ok: false, error: 'Insufficient PULSE tokens' }
    }

    if (adminFloat.usd_balance < usdAmount) {
      return { ok: false, error: 'Insufficient USD balance' }
    }

    // Deduct from admin
    await db
      .from('admin_float')
      .update({
        pulse_tokens_balance: adminFloat.pulse_tokens_balance - pulseAmount,
        usd_balance: adminFloat.usd_balance - usdAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('admin_id', adminId)

    // Credit user via SECURITY DEFINER — no direct wallet writes from server actions
    if (usdAmount > 0) {
      await db.rpc('admin_credit', {
        p_admin_id: adminId,
        p_user_id: userId,
        p_amount: usdAmount,
        p_reason: 'Admin float allocation (USD)',
      })
    }
    if (pulseAmount > 0) {
      await db.rpc('admin_credit', {
        p_admin_id: adminId,
        p_user_id: userId,
        p_amount: pulseAmount,
        p_reason: 'Admin float allocation (PULSE tokens)',
      })
    }

    // Log allocation
    await db.from('float_allocations').insert({
      from_admin_id: adminId,
      to_user_id: userId,
      pulse_amount: pulseAmount,
      usd_amount: usdAmount,
      created_at: new Date().toISOString(),
    }).catch(() => {})

    revalidateTag(`admin-float-${adminId}`)
    revalidateTag(`user-${userId}`)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

export async function getFloatHistory(adminId: string) {
  try {
    const db = serviceClient()
    const { data, error } = await db
      .from('float_allocations')
      .select('*')
      .eq('from_admin_id', adminId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true, data: data || [] }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}
