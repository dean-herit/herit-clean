'use client'

// Prevent static generation for dynamic pages
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  BuildingOfficeIcon, 
  BanknotesIcon, 
  TruckIcon, 
  ComputerDesktopIcon, 
  DocumentTextIcon 
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useAssets } from '@/hooks/use-optimistic'

const assetTypes = [
  { id: 'all', name: 'All Assets', icon: DocumentTextIcon, color: 'gray' },
  { id: 'financial', name: 'Financial', icon: BanknotesIcon, color: 'green' },
  { id: 'real_estate', name: 'Real Estate', icon: BuildingOfficeIcon, color: 'blue' },
  { id: 'business', name: 'Business', icon: TruckIcon, color: 'purple' },
  { id: 'physical', name: 'Physical', icon: TruckIcon, color: 'orange' },
  { id: 'digital', name: 'Digital', icon: ComputerDesktopIcon, color: 'indigo' },
]

const colorClasses = {
  gray: { bg: 'bg-gray-50 dark:bg-gray-900/20', text: 'text-gray-600 dark:text-gray-400' },
  green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400' }
}

export default function AssetsPage() {
  const [selectedType, setSelectedType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  const { data: assets, isLoading, error } = useAssets()

  const filteredAssets = (assets || []).filter((asset: any) => {
    const matchesType = selectedType === 'all' || asset.assetType === selectedType
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (asset.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  const getTypeColor = (type: string) => {
    const typeConfig = assetTypes.find(t => t.id === type)
    return typeConfig?.color || 'gray'
  }

  const getTypeIcon = (type: string) => {
    const typeConfig = assetTypes.find(t => t.id === type)
    return typeConfig?.icon || DocumentTextIcon
  }

  const formatCurrency = (amount: number, currency = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Unable to load assets</div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Assets
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Manage your financial and physical assets
          </p>
        </div>
        <Link
          href="/assets/create"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add Asset
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <div className="flex items-center">
            <div className="rounded-md p-3 bg-blue-50 dark:bg-blue-900/20">
              <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading ? '...' : (assets?.length || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <div className="flex items-center">
            <div className="rounded-md p-3 bg-green-50 dark:bg-green-900/20">
              <BanknotesIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading ? '...' : formatCurrency((assets || []).reduce((sum: number, asset: any) => sum + (asset.value || 0), 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <div className="flex items-center">
            <div className="rounded-md p-3 bg-yellow-50 dark:bg-yellow-900/20">
              <DocumentTextIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Verified</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading ? '...' : (assets || []).filter((a: any) => a.verified).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <div className="flex items-center">
            <div className="rounded-md p-3 bg-red-50 dark:bg-red-900/20">
              <DocumentTextIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading ? '...' : (assets || []).filter((a: any) => !a.verified).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:text-white text-sm"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {assetTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Asset Type Tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          {assetTypes.map(type => {
            const Icon = type.icon
            const isActive = selectedType === type.id
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`
                  inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {type.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Assets List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {filteredAssets.length} {filteredAssets.length === 1 ? 'Asset' : 'Assets'}
          </h2>
        </div>
        
        <div className="overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="px-6 py-4">
                  <div className="animate-pulse flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="rounded-lg w-10 h-10 bg-gray-200 dark:bg-gray-700"></div>
                      <div className="flex-1 min-w-0">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-1"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAssets.map((asset: any) => {
                const Icon = getTypeIcon(asset.assetType)
                const colorKey = getTypeColor(asset.assetType) as keyof typeof colorClasses
                return (
                  <li key={asset.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`rounded-lg p-2 ${colorClasses[colorKey]?.bg || colorClasses.gray.bg}`}>
                          <Icon className={`h-6 w-6 ${colorClasses[colorKey]?.text || colorClasses.gray.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {asset.name}
                            </p>
                            {asset.verified && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {asset.assetType} • {asset.location || 'Unknown location'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {asset.description || 'No description'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(asset.value || 0)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Added {new Date(asset.createdAt || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {!isLoading && filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No assets found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || selectedType !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by adding your first asset.'
              }
            </p>
            <div className="mt-6">
              <Link
                href="/assets/create"
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <PlusIcon className="h-5 w-5" />
                Add Asset
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}