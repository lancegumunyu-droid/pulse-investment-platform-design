'use server'

import { createClient } from '@/lib/supabase/server'

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
    // Upload government ID if provided
    let govIdUrl = null
    if (formData.governmentId) {
      const fileName = `kyc/${user.id}/${Date.now()}-gov-id`
      const { error: uploadError, data } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, formData.governmentId)

      if (uploadError) {
        return { error: `Failed to upload government ID: ${uploadError.message}` }
      }
      govIdUrl = data?.path
    }

    // Upload proof of address if provided
    let proofUrl = null
    if (formData.proofOfAddress) {
      const fileName = `kyc/${user.id}/${Date.now()}-proof-of-address`
      const { error: uploadError, data } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, formData.proofOfAddress)

      if (uploadError) {
        return { error: `Failed to upload proof of address: ${uploadError.message}` }
      }
      proofUrl = data?.path
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
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return { error: `Failed to submit KYC: ${error.message}` }
    }

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
