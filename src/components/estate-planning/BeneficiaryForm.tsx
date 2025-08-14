'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/forms/input'
import { Select } from '@/components/ui/forms/select'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/data-display/card'
import { cn, formatPercentage } from '@/lib/utils'
import { beneficiarySchema, type BeneficiaryInput, RELATIONSHIP_TYPES, IRISH_COUNTIES } from '@/lib/validations'
import { createBeneficiary, updateBeneficiary } from '@/actions/beneficiaries'
import { type Beneficiary } from '@/db/schema'
import useCopy from '@/hooks/useCopy'

interface BeneficiaryFormProps {
  beneficiary?: Beneficiary
  onSuccess?: (beneficiary: BeneficiaryInput) => void
  onCancel?: () => void
  className?: string
  currentPercentageTotal?: number
}

const relationshipOptions = RELATIONSHIP_TYPES.map(type => ({
  value: type,
  label: type.charAt(0).toUpperCase() + type.slice(1)
}))

const countyOptions = IRISH_COUNTIES.map(county => ({
  value: county,
  label: county
}))

export function BeneficiaryForm({ 
  beneficiary, 
  onSuccess, 
  onCancel, 
  className,
  currentPercentageTotal = 0
}: BeneficiaryFormProps) {
  const { copy } = useCopy()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState<BeneficiaryInput>({
    name: beneficiary?.name || '',
    relationshipType: (beneficiary?.relationshipType as BeneficiaryInput['relationshipType']) || 'spouse',
    email: beneficiary?.email || '',
    phone: beneficiary?.phone || '',
    addressLine1: beneficiary?.addressLine1 || '',
    addressLine2: beneficiary?.addressLine2 || '',
    city: beneficiary?.city || '',
    county: beneficiary?.county || '',
    eircode: beneficiary?.eircode || '',
    country: beneficiary?.country || 'Ireland',
    percentage: beneficiary?.percentage || undefined,
    conditions: beneficiary?.conditions || '',
  })
  
  const isEditing = !!beneficiary
  const availablePercentage = 100 - currentPercentageTotal + (beneficiary?.percentage || 0)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    
    try {
      // Additional validation for percentage
      if (formData.percentage && formData.percentage > availablePercentage) {
        throw new Error(`Percentage cannot exceed ${availablePercentage}% (${formatPercentage(availablePercentage)} remaining)`)
      }
      
      // Validate form data
      const validatedData = beneficiarySchema.parse(formData)
      
      let result: Beneficiary
      if (isEditing) {
        result = await updateBeneficiary(beneficiary.id, validatedData)
      } else {
        result = await createBeneficiary(validatedData)
      }
      
      onSuccess?.(validatedData)
    } catch (error) {
      if (error instanceof Error) {
        // Handle validation errors
        if (error.message.includes('validation')) {
          try {
            const validationError = JSON.parse(error.message)
            setErrors(validationError)
          } catch {
            setErrors({ general: error.message })
          }
        } else {
          setErrors({ general: error.message })
        }
      } else {
        setErrors({ general: 'An unexpected error occurred' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleInputChange = (field: keyof BeneficiaryInput, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }
  
  return (
    <Card className={cn('w-full max-w-4xl', className)}>
      <CardHeader>
        <CardTitle>
          {isEditing 
            ? copy('beneficiaries.form.edit_beneficiary', 'Edit Beneficiary') 
            : copy('beneficiaries.form.add_beneficiary', 'Add New Beneficiary')
          }
        </CardTitle>
        {availablePercentage < 100 && (
          <p className="text-sm text-gray-600">
            Available inheritance: {formatPercentage(availablePercentage)} of estate
          </p>
        )}
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-8">
          {errors.general && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{errors.general}</div>
            </div>
          )}
          
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Input
                  label={copy('beneficiaries.form.name_label', 'Full Name')}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={errors.name}
                  placeholder="e.g., John Smith"
                  required
                />
              </div>
              
              <div>
                <Select
                  label={copy('beneficiaries.form.relationship_label', 'Relationship')}
                  options={relationshipOptions}
                  value={formData.relationshipType}
                  onChange={(value) => handleInputChange('relationshipType', value as string)}
                  error={errors.relationshipType}
                />
              </div>
              
              <div>
                <Input
                  label={copy('beneficiaries.form.email_label', 'Email (Optional)')}
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                  placeholder="john@example.com"
                />
              </div>
              
              <div>
                <Input
                  label={copy('beneficiaries.form.phone_label', 'Phone (Optional)')}
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={errors.phone}
                  placeholder="+353 1 234 5678"
                />
              </div>
            </div>
          </div>
          
          {/* Address Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Address (Optional)</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Input
                  label={copy('beneficiaries.form.address_line_1_label', 'Address Line 1')}
                  value={formData.addressLine1 || ''}
                  onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                  error={errors.addressLine1}
                  placeholder="123 Main Street"
                />
              </div>
              
              <div>
                <Input
                  label={copy('beneficiaries.form.address_line_2_label', 'Address Line 2')}
                  value={formData.addressLine2 || ''}
                  onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                  error={errors.addressLine2}
                  placeholder="Apartment, suite, etc."
                />
              </div>
              
              <div>
                <Input
                  label={copy('beneficiaries.form.city_label', 'City')}
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  error={errors.city}
                  placeholder="Dublin"
                />
              </div>
              
              <div>
                <Select
                  label={copy('beneficiaries.form.county_label', 'County')}
                  options={countyOptions}
                  value={formData.county || ''}
                  onChange={(value) => handleInputChange('county', value as string)}
                  error={errors.county}
                  placeholder="Select county"
                />
              </div>
              
              <div>
                <Input
                  label={copy('beneficiaries.form.eircode_label', 'Eircode')}
                  value={formData.eircode || ''}
                  onChange={(e) => handleInputChange('eircode', e.target.value)}
                  error={errors.eircode}
                  placeholder="A12 B3C4"
                />
              </div>
              
              <div>
                <Input
                  label={copy('beneficiaries.form.country_label', 'Country')}
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  error={errors.country}
                />
              </div>
            </div>
          </div>
          
          {/* Inheritance Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Inheritance Details</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Input
                  label={copy('beneficiaries.form.percentage_label', 'Percentage of Estate (%)')}
                  type="number"
                  value={formData.percentage || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === '') {
                      handleInputChange('percentage', '')
                    } else {
                      const numValue = parseFloat(value)
                      if (!isNaN(numValue)) {
                        handleInputChange('percentage', numValue)
                      }
                    }
                  }}
                  error={errors.percentage}
                  min="0"
                  max={availablePercentage}
                  step="0.1"
                  placeholder="25.0"
                  helpText={`Maximum: ${formatPercentage(availablePercentage)}`}
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                {copy('beneficiaries.form.conditions_label', 'Special Conditions (Optional)')}
              </label>
              <div className="mt-1">
                <textarea
                  rows={3}
                  value={formData.conditions || ''}
                  onChange={(e) => handleInputChange('conditions', e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="e.g., Only if they reach age 25, or upon completion of education..."
                />
              </div>
              {errors.conditions && (
                <p className="mt-1 text-sm text-red-600">{errors.conditions}</p>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex gap-3">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1 sm:flex-none"
          >
            {isSubmitting 
              ? (copy('common.messages.saving', 'Saving...')) 
              : isEditing 
                ? (copy('common.buttons.save', 'Save Changes'))
                : (copy('common.buttons.add', 'Add Beneficiary'))
            }
          </Button>
          
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {copy('common.buttons.cancel', 'Cancel')}
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}