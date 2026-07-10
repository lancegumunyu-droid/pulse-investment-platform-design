'use client'

import { useState } from 'react'
import { submitKycData } from '@/app/actions/kyc-submit'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, CheckCircle, Loader2, Upload } from 'lucide-react'

interface KycFormProps {
  onSuccess?: () => void
  compact?: boolean
}

export function KycForm({ onSuccess, compact = false }: KycFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [govIdFile, setGovIdFile] = useState<File | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)

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
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'gov' | 'proof') => {
    if (e.target.files?.[0]) {
      if (type === 'gov') {
        setGovIdFile(e.target.files[0])
      } else {
        setProofFile(e.target.files[0])
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await submitKycData({
      ...formData,
      governmentId: govIdFile,
      proofOfAddress: proofFile,
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
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <CheckCircle className="mx-auto mb-3 size-8 text-green-600" />
        <h3 className="mb-2 font-semibold text-green-900">KYC Submitted Successfully</h3>
        <p className="text-sm text-green-700">Your application is under review. You&apos;ll receive updates via email.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${compact ? 'max-w-md' : ''}`}>
      {error && (
        <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 size-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Personal Information */}
      <div>
        <h3 className="mb-4 font-semibold text-foreground">Personal Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="bg-white"
          />
          <Input
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="bg-white"
          />
          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="sm:col-span-2 bg-white"
          />
          <Input
            name="dateOfBirth"
            type="date"
            placeholder="Date of Birth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
            className="sm:col-span-2 bg-white"
          />
        </div>
      </div>

      {/* Identification */}
      <div>
        <h3 className="mb-4 font-semibold text-foreground">Identification</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select value={formData.idType} onValueChange={(value) => handleSelectChange('idType', value)}>
            <SelectTrigger className="bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="passport">Passport</SelectItem>
              <SelectItem value="national_id">National ID</SelectItem>
              <SelectItem value="driver_license">Driver License</SelectItem>
            </SelectContent>
          </Select>
          <Input
            name="idNumber"
            placeholder="ID Number"
            value={formData.idNumber}
            onChange={handleChange}
            required
            className="bg-white"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="mb-4 font-semibold text-foreground">Address</h3>
        <div className="grid gap-4">
          <Textarea
            name="address"
            placeholder="Street Address"
            value={formData.address}
            onChange={handleChange}
            required
            className="min-h-20 resize-none bg-white"
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              required
              className="bg-white"
            />
            <Input
              name="postalCode"
              placeholder="Postal Code"
              value={formData.postalCode}
              onChange={handleChange}
              required
              className="bg-white"
            />
            <Select value={formData.country} onValueChange={(value) => handleSelectChange('country', value)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ZA">South Africa</SelectItem>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="GB">United Kingdom</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input
            name="nationality"
            placeholder="Nationality"
            value={formData.nationality}
            onChange={handleChange}
            required
            className="bg-white"
          />
        </div>
      </div>

      {/* Document Uploads */}
      <div>
        <h3 className="mb-4 font-semibold text-foreground">Documents</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col">
            <label className="mb-2 text-sm text-muted-foreground">Government ID (PDF, JPG, PNG)</label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 hover:border-gold/50 transition-colors">
              <Upload className="size-4" />
              <span className="text-sm">{govIdFile ? govIdFile.name : 'Upload ID'}</span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'gov')}
                className="hidden"
                required
              />
            </label>
          </div>
          <div className="flex flex-col">
            <label className="mb-2 text-sm text-muted-foreground">Proof of Address (PDF, JPG, PNG)</label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 hover:border-gold/50 transition-colors">
              <Upload className="size-4" />
              <span className="text-sm">{proofFile ? proofFile.name : 'Upload Document'}</span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'proof')}
                className="hidden"
                required
              />
            </label>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
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
