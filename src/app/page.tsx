'use client'

import { useState } from 'react'
import { useCopy } from '@/hooks/useCopy'
import { useDashboard, useCreateAsset, useCreateBeneficiary } from '@/hooks/use-optimistic'
import { AssetForm } from '@/components/estate-planning/AssetForm'
import { BeneficiaryForm } from '@/components/estate-planning/BeneficiaryForm'
import { AssetInput, BeneficiaryInput } from '@/lib/validations'

export default function TestPage() {
  const { copy } = useCopy()
  const { assets, beneficiaries, isLoading } = useDashboard()
  const createAsset = useCreateAsset()
  const createBeneficiary = useCreateBeneficiary()
  
  const [showAssetForm, setShowAssetForm] = useState(false)
  const [showBeneficiaryForm, setShowBeneficiaryForm] = useState(false)

  const handleCreateAsset = async (data: AssetInput) => {
    await createAsset.mutateAsync(data)
    setShowAssetForm(false)
  }

  const handleCreateBeneficiary = async (data: BeneficiaryInput) => {
    await createBeneficiary.mutateAsync(data)
    setShowBeneficiaryForm(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {copy('estate.dashboard.title', 'Estate Planning Dashboard')}
          </h1>
          <p className="mt-2 text-gray-600">
            {copy('estate.dashboard.subtitle', 'Manage your assets and beneficiaries')}
          </p>
        </div>

        {/* Assets Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {copy('estate.assets.title', 'Assets')}
            </h2>
            <button
              onClick={() => setShowAssetForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {copy('estate.assets.add', 'Add Asset')}
            </button>
          </div>

          {showAssetForm && (
            <div className="mb-6">
              <AssetForm
                onSuccess={handleCreateAsset}
                onCancel={() => setShowAssetForm(false)}
              />
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {assets.data?.length === 0 ? (
                <li className="px-6 py-4 text-gray-500 text-center">
                  {copy('estate.assets.empty', 'No assets added yet')}
                </li>
              ) : (
                assets.data?.map((asset) => (
                  <li key={asset.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {asset.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {asset.assetType} • €{asset.value.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          asset.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {asset.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Beneficiaries Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {copy('estate.beneficiaries.title', 'Beneficiaries')}
            </h2>
            <button
              onClick={() => setShowBeneficiaryForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {copy('estate.beneficiaries.add', 'Add Beneficiary')}
            </button>
          </div>

          {showBeneficiaryForm && (
            <div className="mb-6">
              <BeneficiaryForm
                onSuccess={handleCreateBeneficiary}
                onCancel={() => setShowBeneficiaryForm(false)}
              />
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {beneficiaries.data?.length === 0 ? (
                <li className="px-6 py-4 text-gray-500 text-center">
                  {copy('estate.beneficiaries.empty', 'No beneficiaries added yet')}
                </li>
              ) : (
                beneficiaries.data?.map((beneficiary) => (
                  <li key={beneficiary.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {beneficiary.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {beneficiary.relationshipType}
                          {beneficiary.percentage && ` • ${beneficiary.percentage}%`}
                        </p>
                        {beneficiary.email && (
                          <p className="text-sm text-gray-500">{beneficiary.email}</p>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          beneficiary.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {beneficiary.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Status Information */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              System Status
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Testing the complete vertical slice of the estate planning application.</p>
            </div>
            <div className="mt-5 space-y-3">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">
                    Copy/Translation System: {typeof copy === 'function' ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">
                    React Query: {assets.data !== undefined ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">
                    Server Actions: {createAsset && createBeneficiary ? 'Available' : 'Unavailable'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
