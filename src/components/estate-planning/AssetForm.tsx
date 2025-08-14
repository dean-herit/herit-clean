'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/forms/input'
import { Select } from '@/components/ui/forms/select'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/data-display/card'
import { cn, formatCurrency } from '@/lib/utils'
import { assetSchema, type AssetInput, ASSET_TYPES } from '@/lib/validations'
import { createAsset, updateAsset } from '@/actions/assets'
import { type Asset } from '@/db/schema'
import useCopy from '@/hooks/useCopy'

interface AssetFormProps {
  asset?: Asset
  onSuccess?: (asset: AssetInput) => void
  onCancel?: () => void
  className?: string
}

const assetTypeOptions = ASSET_TYPES.map(type => ({
  value: type,
  label: type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}))

export function AssetForm({ asset, onSuccess, onCancel, className }: AssetFormProps) {
  const { copy } = useCopy()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState<AssetInput>({
    name: asset?.name || '',
    assetType: (asset?.assetType as AssetInput['assetType']) || 'bank_account',
    value: asset?.value || 0,
    description: asset?.description || '',
    accountNumber: asset?.accountNumber || '',
    bankName: asset?.bankName || '',
    propertyAddress: asset?.propertyAddress || '',
  })
  
  const isEditing = !!asset
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    
    try {
      // Validate form data
      const validatedData = assetSchema.parse(formData)
      
      let result: Asset
      if (isEditing) {
        result = await updateAsset(asset.id, validatedData)
      } else {
        result = await createAsset(validatedData)
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
  
  const handleInputChange = (field: keyof AssetInput, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }
  
  return (
    <Card className={cn('w-full max-w-2xl', className)}>
      <CardHeader>
        <CardTitle>
          {isEditing ? copy('assets.form.edit_asset', 'Edit Asset') : copy('assets.form.add_asset', 'Add New Asset')}
        </CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {errors.general && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{errors.general}</div>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label={copy('assets.form.name_label', 'Asset Name')}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                placeholder="e.g., Primary residence, Savings account"
                required
              />
            </div>
            
            <div>
              <Select
                label={copy('assets.form.type_label', 'Asset Type')}
                options={assetTypeOptions}
                value={formData.assetType}
                onChange={(value) => handleInputChange('assetType', value as string)}
                error={errors.assetType}
              />
            </div>
            
            <div>
              <Input
                label={copy('assets.form.value_label', 'Estimated Value (€)')}
                type="number"
                value={formData.value}
                onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
                error={errors.value}
                min="0"
                step="0.01"
                required
              />
              {formData.value > 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  {formatCurrency(formData.value)}
                </p>
              )}
            </div>
            
            {formData.assetType === 'bank_account' && (
              <>
                <div>
                  <Input
                    label={copy('assets.form.bank_name_label', 'Bank Name')}
                    value={formData.bankName || ''}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    error={errors.bankName}
                    placeholder="e.g., AIB, Bank of Ireland"
                  />
                </div>
                
                <div>
                  <Input
                    label={copy('assets.form.account_number_label', 'Account Number')}
                    value={formData.accountNumber || ''}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    error={errors.accountNumber}
                    placeholder="Last 4 digits for reference"
                  />
                </div>
              </>
            )}
            
            {formData.assetType === 'property' && (
              <div className="sm:col-span-2">
                <Input
                  label={copy('assets.form.property_address_label', 'Property Address')}
                  value={formData.propertyAddress || ''}
                  onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
                  error={errors.propertyAddress}
                  placeholder="Full property address"
                />
              </div>
            )}
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                {copy('assets.form.description_label', 'Description (Optional)')}
              </label>
              <div className="mt-1">
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Additional details about this asset..."
                />
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
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
              ? copy('common.messages.saving', 'Saving...') 
              : isEditing 
                ? copy('common.buttons.save', 'Save Changes')
                : copy('common.buttons.add', 'Add Asset')
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