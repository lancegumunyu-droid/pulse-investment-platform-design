'use client'

import { useState } from 'react'
import { submitKycData } from '@/app/actions/kyc-submit'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { KycCameraCapture } from '@/components/pulse/kyc-camera-capture'

interface KycFormProps {
  onSuccess?: () => void
  compact?: boolean
}

export function KycForm({ onSuccess, compact = false }: KycFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // camera/file captures stored as base64 data URLs
  const [selfieCapture, setSelfieCapture] = useState<string | null>(null)
  const [govIdCapture, setGovIdCapture] = useState<string | null>(null)
  const [proofCapture, setProofCapture] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    nationality: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    idType: 'passport',
    idNumber: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Convert base64 data URL → File object for the existing action
  function dataUrlToFile(dataUrl: string, filename: string): File {
    const [header, data] = dataUrl.split(',')
    const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
    const bytes = atob(data)
    const arr = new Uint8Array(bytes.length)
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
    return new File([arr], filename, { type: mime })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!govIdCapture) {
      setError('Please capture or upload your Government ID.')
      return
    }

    setLoading(true)

    const govIdFile = dataUrlToFile(govIdCapture, 'government-id.jpg')
    const proofFile = proofCapture ? dataUrlToFile(proofCapture, 'proof-of-address.jpg') : undefined

    const result = await submitKycData({
      ...formData,
      governmentId: govIdFile,
      proofOfAddress: proofFile ?? null,
      selfie: selfieCapture ? dataUrlToFile(selfieCapture, 'selfie.jpg') : undefined,
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      onSuccess?.()
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle className="mx-auto mb-3 size-10 text-green-600" />
        <h3 className="mb-2 text-lg font-semibold text-green-900">KYC Submitted Successfully</h3>
        <p className="text-sm text-green-700">Your application is under review. You&apos;ll receive updates via email within 1–2 business days.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-8 ${compact ? 'max-w-md' : ''}`}>
      {error && (
        <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 size-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1 — Personal Information */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-dark">1</span>
          <h3 className="font-semibold text-foreground">Personal Information</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <Input
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <Input
            name="email"
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="sm:col-span-2"
          />
          <Input
            name="dateOfBirth"
            type="date"
            placeholder="Date of Birth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
            className="sm:col-span-2"
          />
          <Input
            name="nationality"
            placeholder="Nationality"
            value={formData.nationality}
            onChange={handleChange}
            required
            className="sm:col-span-2"
          />
        </div>
      </section>

      {/* Step 2 — Address */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-dark">2</span>
          <h3 className="font-semibold text-foreground">Residential Address</h3>
        </div>
        <div className="grid gap-4">
          <Textarea
            name="address"
            placeholder="Street Address"
            value={formData.address}
            onChange={handleChange}
            required
            className="min-h-20 resize-none"
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              required
            />
            <Input
              name="postalCode"
              placeholder="Postal Code"
              value={formData.postalCode}
              onChange={handleChange}
              required
            />
            <Select value={formData.country} onValueChange={v => handleSelectChange('country', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ZA">South Africa</SelectItem>
                <SelectItem value="NG">Nigeria</SelectItem>
                <SelectItem value="KE">Kenya</SelectItem>
                <SelectItem value="GH">Ghana</SelectItem>
                <SelectItem value="EG">Egypt</SelectItem>
                <SelectItem value="ZW">Zimbabwe</SelectItem>
                <SelectItem value="BW">Botswana</SelectItem>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="GB">United Kingdom</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Step 3 — Identification */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-dark">3</span>
          <h3 className="font-semibold text-foreground">Identification Document</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select value={formData.idType} onValueChange={v => handleSelectChange('idType', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="passport">Passport</SelectItem>
              <SelectItem value="national_id">National ID</SelectItem>
              <SelectItem value="driver_license">Driver&apos;s License</SelectItem>
            </SelectContent>
          </Select>
          <Input
            name="idNumber"
            placeholder="ID / Document Number"
            value={formData.idNumber}
            onChange={handleChange}
            required
          />
        </div>
      </section>

      {/* Step 4 — Document Photos */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-dark">4</span>
          <h3 className="font-semibold text-foreground">Document Photos</h3>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Use your camera to take a clear photo or upload an existing image. Make sure all text is clearly readable.
        </p>

        <KycCameraCapture
          label="Government ID (Front)"
          hint="Take a clear photo of the front of your passport, national ID or driver's license."
          value={govIdCapture}
          onChange={setGovIdCapture}
        />

        <KycCameraCapture
          label="Proof of Address (Optional)"
          hint="Bank statement, utility bill or official letter dated within the last 3 months."
          value={proofCapture}
          onChange={setProofCapture}
        />
      </section>

      {/* Step 5 — Selfie */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-dark">5</span>
          <h3 className="font-semibold text-foreground">Selfie Verification (Optional)</h3>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Hold your ID next to your face and take a photo. This helps us verify you are the document owner.
        </p>
        <KycCameraCapture
          label="Selfie with ID"
          hint="Face clearly visible, holding your ID document next to your face."
          value={selfieCapture}
          onChange={setSelfieCapture}
          accept="image/*"
        />
      </section>

      {/* Notice */}
      <div className="rounded-lg border border-border/50 bg-muted/20 p-4 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground text-sm">Why do we need this?</p>
        <p>Your documents are encrypted and stored securely. We comply with international AML/KYC regulations to protect all users on the platform.</p>
      </div>

      <Button
        type="submit"
        disabled={loading || !govIdCapture}
        className="w-full bg-gold hover:bg-gold/90 text-dark font-semibold"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit KYC Application'
        )}
      </Button>
    </form>
  )
}
