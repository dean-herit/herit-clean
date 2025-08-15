'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowRightIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

// Irish counties for dropdown
const IRISH_COUNTIES = [
  'Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry', 'Donegal',
  'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry', 'Kildare', 'Kilkenny',
  'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath',
  'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Tyrone',
  'Waterford', 'Westmeath', 'Wexford', 'Wicklow'
]

interface PersonalInfo {
  first_name: string
  last_name: string
  email: string
  date_of_birth: string
  phone_number: string
  address_line_1: string
  address_line_2: string
  city: string
  county: string
  eircode: string
  profile_photo: string | null
}

interface PersonalInfoStepProps {
  initialData: PersonalInfo
  loading: boolean
  onChange: (data: PersonalInfo) => void
  onComplete: (data: PersonalInfo) => void
  onBack?: () => void
}

export default function PersonalInfoStep({
  initialData,
  loading,
  onChange,
  onComplete,
  onBack,
}: PersonalInfoStepProps) {
  const [formData, setFormData] = useState<PersonalInfo>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Load existing personal info on mount
  useEffect(() => {
    const fetchPersonalInfo = async () => {
      try {
        setLoadingData(true)
        const response = await fetch('/api/onboarding/personal-info')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            const personalInfo = {
              first_name: data.data.first_name || '',
              last_name: data.data.last_name || '',
              email: data.data.email || '',
              date_of_birth: data.data.date_of_birth || '',
              phone_number: data.data.phone_number || '',
              address_line_1: data.data.address_line_1 || '',
              address_line_2: data.data.address_line_2 || '',
              city: data.data.city || '',
              county: data.data.county || '',
              eircode: data.data.eircode || '',
              profile_photo: data.data.profile_photo || null,
            }
            setFormData(personalInfo)
            onChange(personalInfo)
          }
        }
      } catch (error) {
        console.error('Error loading personal info:', error)
        // Use initialData as fallback
        setFormData(initialData)
        onChange(initialData)
      } finally {
        setLoadingData(false)
      }
    }

    fetchPersonalInfo()
  }, [])

  // Update parent state when form data changes
  const updateFormData = (updates: Partial<PersonalInfo>) => {
    const newData = { ...formData, ...updates }
    setFormData(newData)
    onChange(newData)
  }
  
  // Basic validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    }
    
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required'
    } else {
      const birthDate = new Date(formData.date_of_birth)
      const eighteenYearsAgo = new Date()
      eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18)
      
      if (birthDate > eighteenYearsAgo) {
        newErrors.date_of_birth = 'You must be at least 18 years old'
      }
    }
    
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required'
    }
    
    if (!formData.address_line_1.trim()) {
      newErrors.address_line_1 = 'Street address is required'
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }
    
    if (!formData.county) {
      newErrors.county = 'County is required'
    }
    
    if (!formData.eircode.trim()) {
      newErrors.eircode = 'Eircode is required'
    } else {
      const eircodePattern = /^[A-Z0-9]{3}\s?[A-Z0-9]{4}$/i
      if (!eircodePattern.test(formData.eircode.replace(/\s/g, ''))) {
        newErrors.eircode = 'Please enter a valid Eircode (e.g., D02 XY45)'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      // Save personal info to backend
      const response = await fetch('/api/onboarding/personal-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.errors) {
          setErrors(errorData.errors)
          return
        }
        throw new Error(errorData.error || 'Failed to save personal information')
      }
      
      // Complete this step
      onComplete(formData)
      
    } catch (error) {
      console.error('Error saving personal info:', error)
      setErrors({ 
        submit: error instanceof Error ? error.message : 'Failed to save personal information. Please try again.' 
      })
    }
  }
  
  // Handle photo upload
  const handlePhotoUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, photo: 'Please select an image file' }))
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, photo: 'Image must be smaller than 5MB' }))
      return
    }
    
    setUploadingPhoto(true)
    setErrors(prev => ({ ...prev, photo: '' }))
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload/profile-photo', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Failed to upload photo')
      }
      
      const result = await response.json()
      updateFormData({ profile_photo: result.url })
      
    } catch (error) {
      console.error('Photo upload error:', error)
      setErrors(prev => ({ ...prev, photo: 'Failed to upload photo. Please try again.' }))
    } finally {
      setUploadingPhoto(false)
    }
  }
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handlePhotoUpload(file)
    }
  }
  
  // Remove photo
  const handleRemovePhoto = () => {
    updateFormData({ profile_photo: null })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  // Show loading state while data is being fetched
  if (loadingData) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-theme-text">
            Loading Your Information
          </h3>
          <p className="mt-2 text-sm text-theme-text-muted">
            Please wait while we load your existing information...
          </p>
        </div>
        <div className="bg-theme-surface rounded-theme-xl p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-brand mx-auto"></div>
          <p className="mt-4 text-sm text-theme-text-muted">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Submission Error */}
      {errors.submit && (
        <div className="bg-theme-danger/10 border border-theme-danger/20 text-theme-danger px-4 py-3 rounded-theme-xl text-sm">
          {errors.submit}
        </div>
      )}
      
      {/* Name Fields */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2" data-ui="field:first-name">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-theme-text mb-2">
            First Name *
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={(e) => updateFormData({ first_name: e.target.value })}
            className={`block w-full h-12 rounded-theme-xl border bg-theme-input-bg px-4 py-3 text-theme-text placeholder-theme-text-muted shadow-sm focus:ring-2 focus:ring-theme-brand focus:border-theme-brand sm:text-sm transition-colors ${
              errors.first_name ? 'border-theme-danger focus:ring-theme-danger' : 'border-theme-input-border'
            }`}
            placeholder="Enter your first name"
          />
          {errors.first_name && (
            <p className="mt-1 text-sm text-theme-danger">{errors.first_name}</p>
          )}
        </div>

        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-theme-text mb-2">
            Last Name *
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={(e) => updateFormData({ last_name: e.target.value })}
            className={`block w-full h-12 rounded-theme-xl border bg-theme-input-bg px-4 py-3 text-theme-text placeholder-theme-text-muted shadow-sm focus:ring-2 focus:ring-theme-brand focus:border-theme-brand sm:text-sm transition-colors ${
              errors.last_name ? 'border-theme-danger focus:ring-theme-danger' : 'border-theme-input-border'
            }`}
            placeholder="Enter your last name"
          />
          {errors.last_name && (
            <p className="mt-1 text-sm text-theme-danger">{errors.last_name}</p>
          )}
        </div>
      </div>

      {/* Email Field (read-only) */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-theme-text mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          readOnly
          className="block w-full h-12 rounded-theme-xl border border-theme-input-border bg-theme-surface px-4 py-3 text-theme-text-muted cursor-not-allowed sm:text-sm"
        />
        <p className="mt-1 text-xs text-theme-text-muted">
          This email is from your account and cannot be changed here.
        </p>
      </div>

      {/* Date of Birth and Phone */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="date_of_birth" className="block text-sm font-medium text-theme-text mb-2">
            Date of Birth *
          </label>
          <input
            type="date"
            id="date_of_birth"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={(e) => updateFormData({ date_of_birth: e.target.value })}
            className={`block w-full h-12 rounded-theme-xl border bg-theme-input-bg px-4 py-3 text-theme-text shadow-sm focus:ring-2 focus:ring-theme-brand focus:border-theme-brand sm:text-sm transition-colors ${
              errors.date_of_birth ? 'border-theme-danger focus:ring-theme-danger' : 'border-theme-input-border'
            }`}
          />
          {errors.date_of_birth && (
            <p className="mt-1 text-sm text-theme-danger">{errors.date_of_birth}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-theme-text mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={(e) => updateFormData({ phone_number: e.target.value })}
            className={`block w-full h-12 rounded-theme-xl border bg-theme-input-bg px-4 py-3 text-theme-text placeholder-theme-text-muted shadow-sm focus:ring-2 focus:ring-theme-brand focus:border-theme-brand sm:text-sm transition-colors ${
              errors.phone_number ? 'border-theme-danger focus:ring-theme-danger' : 'border-theme-input-border'
            }`}
            placeholder="+353 85 123 4567"
          />
          {errors.phone_number && (
            <p className="mt-1 text-sm text-theme-danger">{errors.phone_number}</p>
          )}
        </div>
      </div>

      {/* Address Fields */}
      <div className="space-y-6">
        <div>
          <label htmlFor="address_line_1" className="block text-sm font-medium text-theme-text mb-2">
            Street Address *
          </label>
          <input
            type="text"
            id="address_line_1"
            name="address_line_1"
            value={formData.address_line_1}
            onChange={(e) => updateFormData({ address_line_1: e.target.value })}
            className={`block w-full h-12 rounded-theme-xl border bg-theme-input-bg px-4 py-3 text-theme-text placeholder-theme-text-muted shadow-sm focus:ring-2 focus:ring-theme-brand focus:border-theme-brand sm:text-sm transition-colors ${
              errors.address_line_1 ? 'border-theme-danger focus:ring-theme-danger' : 'border-theme-input-border'
            }`}
            placeholder="Enter your street address"
          />
          {errors.address_line_1 && (
            <p className="mt-1 text-sm text-theme-danger">{errors.address_line_1}</p>
          )}
        </div>

        <div>
          <label htmlFor="address_line_2" className="block text-sm font-medium text-theme-text mb-2">
            Address Line 2
          </label>
          <input
            type="text"
            id="address_line_2"
            name="address_line_2"
            value={formData.address_line_2}
            onChange={(e) => updateFormData({ address_line_2: e.target.value })}
            className="block w-full h-12 rounded-theme-xl border border-theme-input-border bg-theme-input-bg px-4 py-3 text-theme-text placeholder-theme-text-muted shadow-sm focus:ring-2 focus:ring-theme-brand focus:border-theme-brand sm:text-sm transition-colors"
            placeholder="Apartment, suite, etc. (optional)"
          />
        </div>
      </div>

      {/* City, County, and Eircode */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-theme-text mb-2">
            City *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={(e) => updateFormData({ city: e.target.value })}
            className={`block w-full h-12 rounded-theme-xl border bg-theme-input-bg px-4 py-3 text-theme-text placeholder-theme-text-muted shadow-sm focus:ring-2 focus:ring-theme-brand focus:border-theme-brand sm:text-sm transition-colors ${
              errors.city ? 'border-theme-danger focus:ring-theme-danger' : 'border-theme-input-border'
            }`}
            placeholder="Enter your city"
          />
          {errors.city && (
            <p className="mt-1 text-sm text-theme-danger">{errors.city}</p>
          )}
        </div>

        <div>
          <label htmlFor="county" className="block text-sm font-medium text-theme-text mb-2">
            County *
          </label>
          <select
            id="county"
            name="county"
            value={formData.county}
            onChange={(e) => updateFormData({ county: e.target.value })}
            className={`block w-full h-12 rounded-theme-xl border bg-theme-input-bg px-4 py-3 text-theme-text shadow-sm focus:ring-2 focus:ring-theme-brand focus:border-theme-brand sm:text-sm transition-colors ${
              errors.county ? 'border-theme-danger focus:ring-theme-danger' : 'border-theme-input-border'
            }`}
          >
            <option value="" className="text-theme-text-muted">Select County</option>
            {IRISH_COUNTIES.map(county => (
              <option key={county} value={county} className="text-theme-text">{county}</option>
            ))}
          </select>
          {errors.county && (
            <p className="mt-1 text-sm text-theme-danger">{errors.county}</p>
          )}
        </div>

        <div>
          <label htmlFor="eircode" className="block text-sm font-medium text-theme-text mb-2">
            Eircode *
          </label>
          <input
            type="text"
            id="eircode"
            name="eircode"
            value={formData.eircode}
            onChange={(e) => updateFormData({ eircode: e.target.value.toUpperCase() })}
            className={`block w-full h-12 rounded-theme-xl border bg-theme-input-bg px-4 py-3 text-theme-text placeholder-theme-text-muted shadow-sm focus:ring-2 focus:ring-theme-brand focus:border-theme-brand sm:text-sm transition-colors ${
              errors.eircode ? 'border-theme-danger focus:ring-theme-danger' : 'border-theme-input-border'
            }`}
            placeholder="D02 XY45"
          />
          {errors.eircode && (
            <p className="mt-1 text-sm text-theme-danger">{errors.eircode}</p>
          )}
        </div>
      </div>

      {/* Profile Photo Section */}
      <div>
        <label className="block text-sm font-medium text-theme-text mb-3">
          Profile Photo (Optional)
        </label>
        
        {formData.profile_photo ? (
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Image
                src={formData.profile_photo}
                alt="Profile"
                width={80}
                height={80}
                className="w-20 h-20 rounded-lg object-cover border border-slate-300 dark:border-slate-600"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="text-sm text-theme-brand hover:text-theme-accent disabled:opacity-50"
              >
                Change Photo
              </button>
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={uploadingPhoto}
                className="text-sm text-theme-danger hover:text-theme-danger/80 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-theme-input-border rounded-theme-xl p-6 text-center cursor-pointer hover:border-theme-brand/50 transition-colors"
          >
            {uploadingPhoto ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-theme-text-muted">Uploading...</span>
              </div>
            ) : (
              <>
                <PhotoIcon className="mx-auto h-12 w-12 text-theme-text-muted mb-3" />
                <p className="text-theme-text-muted">
                  Click to upload a profile photo
                </p>
                <p className="text-xs text-theme-text-muted mt-1">
                  PNG, JPG up to 5MB
                </p>
              </>
            )}
          </div>
        )}
        
        {errors.photo && (
          <p className="mt-1 text-sm text-theme-danger">{errors.photo}</p>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploadingPhoto}
        />
      </div>

      {/* Submit Button - Desktop only, mobile handled by sidebar */}
      <div className="hidden lg:flex justify-end pt-6">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-theme-2xl bg-theme-brand px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-theme-accent focus:outline-none focus:ring-2 focus:ring-theme-brand focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Saving...' : 'Continue'}
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}