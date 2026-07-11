'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateTag } from 'next/cache'

export async function submitKycData(formData: {
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string
  nationality: string
  address: string
  city: string
  postalCode: string
  country: string
  idType: string
  idNumber: string
  proofOfAddress: File | null
  governmentId: File | null
  selfie?: File | null
}) {
  const supabase = await createClient()

  // Get current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized - please login first' }
  }

  try {
    // Upload government ID photo
    let govIdUrl = null
    if (formData.governmentId) {
      const fileName = `kyc/${user.id}/${Date.now()}-gov-id`
      const { error: uploadError, data } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, formData.governmentId, {
          contentType: formData.governmentId.type,
          upsert: false,
        })

      if (uploadError) {
        return { error: `Failed to upload government ID: ${uploadError.message}` }
      }
      govIdUrl = data?.path
    }

    // Upload proof of address photo
    let proofUrl = null
    if (formData.proofOfAddress) {
      const fileName = `kyc/${user.id}/${Date.now()}-proof-of-address`
      const { error: uploadError, data } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, formData.proofOfAddress, {
          contentType: formData.proofOfAddress.type,
          upsert: false,
        })

      if (uploadError) {
        return { error: `Failed to upload proof of address: ${uploadError.message}` }
      }
      proofUrl = data?.path
    }

    // Upload selfie photo
    let selfieUrl = null
    if (formData.selfie) {
      const fileName = `kyc/${user.id}/${Date.now()}-selfie`
      const { error: uploadError, data } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, formData.selfie, {
          contentType: formData.selfie.type,
          upsert: false,
        })

      if (uploadError) {
        return { error: `Failed to upload selfie: ${uploadError.message}` }
      }
      selfieUrl = data?.path
    }

    // Create KYC submission in database
    const { error, data } = await supabase
      .from('kyc_submissions')
      .insert({
        user_id: user.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        date_of_birth: formData.dateOfBirth,
        nationality: formData.nationality,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postalCode,
        country: formData.country,
        id_type: formData.idType,
        id_number: formData.idNumber,
        government_id_url: govIdUrl,
        proof_of_address_url: proofUrl,
        selfie_url: selfieUrl,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return { error: `Failed to submit KYC: ${error.message}` }
    }

    // Update user KYC status
    await supabase
      .from('profiles')
      .update({
        kyc_status: 'submitted',
        kyc_submitted_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    revalidateTag(`user-${user.id}`)
    revalidateTag('pending-kyc-submissions')

    return { success: true, data }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { error: `Submission failed: ${message}` }
  }
}

export async function getKycStatus() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('kyc_submissions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    return { error: error.message }
  }

  return { data: data || null }
}

export async function getPendingKycSubmissions() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('kyc_submissions')
      .select(`
        id,
        user_id,
        first_name,
        last_name,
        email,
        date_of_birth,
        id_type,
        id_number,
        government_id_url,
        proof_of_address_url,
        selfie_url,
        status,
        submitted_at,
        profiles:user_id (id, full_name, email, approval_status)
      `)
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true })

    if (error) {
      console.error('[v0] Error fetching KYC:', error)
      return []
    }
    return data || []
  } catch (err) {
    console.error('[v0] Error in getPendingKycSubmissions:', err)
    return []
  }
}

export async function approveKyc(submissionId: string, adminId: string) {
  try {
    const supabase = await createClient()

    // Get submission to find user_id
    const { data: submission, error: fetchError } = await supabase
      .from('kyc_submissions')
      .select('user_id')
      .eq('id', submissionId)
      .single()

    if (fetchError) throw fetchError

    // Update submission status
    await supabase
      .from('kyc_submissions')
      .update({
        status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString(),
      })
      .eq('id', submissionId)

    // Update user KYC status
    await supabase
      .from('profiles')
      .update({
        kyc_status: 'verified',
        kyc_verified_at: new Date().toISOString(),
      })
      .eq('id', submission.user_id)

    // Log admin action
    await supabase.from('admin_actions').insert({
      admin_id: adminId,
      action: 'kyc_approved',
      target_id: submissionId,
      details: { user_id: submission.user_id },
      created_at: new Date().toISOString(),
    }).catch(() => {}) // Ignore if table doesn't exist

    revalidateTag('pending-kyc-submissions')
    revalidateTag(`user-${submission.user_id}`)

    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Failed to approve KYC' }
  }
}

export async function rejectKyc(submissionId: string, adminId: string, reason: string) {
  try {
    const supabase = await createClient()

    const { data: submission, error: fetchError } = await supabase
      .from('kyc_submissions')
      .select('user_id')
      .eq('id', submissionId)
      .single()

    if (fetchError) throw fetchError

    await supabase
      .from('kyc_submissions')
      .update({
        status: 'rejected',
        rejected_by: adminId,
        rejection_reason: reason,
        rejected_at: new Date().toISOString(),
      })
      .eq('id', submissionId)

    await supabase
      .from('profiles')
      .update({ kyc_status: 'rejected' })
      .eq('id', submission.user_id)

    revalidateTag('pending-kyc-submissions')
    revalidateTag(`user-${submission.user_id}`)

    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Failed to reject KYC' }
  }
}
