'use client'

import { CheckCircleIcon, ClockIcon, UserGroupIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useDashboard } from '@/hooks/use-optimistic'
import { ClientQueryWrapper } from '@/components/providers/ClientQueryWrapper'

interface DashboardMetrics {
  totalAssets: number
  totalBeneficiaries: number
  totalValue: number
  currency: string
  willProgress: number
}

function DashboardContent() {
  const { assets, beneficiaries, isLoading, error } = useDashboard()

  // Calculate metrics from loaded data
  const metrics: DashboardMetrics = {
    totalAssets: assets?.data?.length || 0,
    totalBeneficiaries: beneficiaries?.data?.length || 0,
    totalValue: assets?.data?.reduce((sum: number, asset: any) => sum + (asset.value || 0), 0) || 0,
    currency: 'EUR',
    willProgress: 0, // TODO: Calculate will progress
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Unable to load dashboard data</div>
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
      {/* Welcome Section */}
      <div className="bg-white shadow rounded-lg dark:bg-gray-800">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome to Your Estate Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage your digital estate planning journey
              </p>
            </div>
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="rounded-md p-3 bg-blue-50 dark:bg-blue-900/20">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Assets</dt>
                <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? '...' : metrics.totalAssets}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="rounded-md p-3 bg-green-50 dark:bg-green-900/20">
                <UserGroupIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Beneficiaries</dt>
                <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? '...' : metrics.totalBeneficiaries}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="rounded-md p-3 bg-purple-50 dark:bg-purple-900/20">
                <ClockIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Will Progress</dt>
                <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? '...' : `${metrics.willProgress}%`}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="rounded-md p-3 bg-orange-50 dark:bg-orange-900/20">
                <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H3.75c1.125 0 2.25 1.004 2.25 2.25v.75c0 .621-.504 1.125-1.125 1.125H3.75z" />
                </svg>
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</dt>
                <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? '...' : formatCurrency(metrics.totalValue, metrics.currency)}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg dark:bg-gray-800">
        <div className="px-6 py-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/assets/create" className="group relative rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800">
              <div>
                <div className="rounded-lg inline-flex p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mb-3">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <h4 className="text-base font-medium text-gray-900 dark:text-white mb-1">Add Assets</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add your financial and physical assets</p>
              </div>
            </Link>
            
            <Link href="/beneficiaries/create" className="group relative rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800">
              <div>
                <div className="rounded-lg inline-flex p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 mb-3">
                  <UserGroupIcon className="h-6 w-6" />
                </div>
                <h4 className="text-base font-medium text-gray-900 dark:text-white mb-1">Add Beneficiaries</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Define who will inherit your assets</p>
              </div>
            </Link>

            <Link href="/will/create" className="group relative rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800">
              <div>
                <div className="rounded-lg inline-flex p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 mb-3">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125-1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                </div>
                <h4 className="text-base font-medium text-gray-900 dark:text-white mb-1">Continue Will</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Continue working on your will</p>
              </div>
            </Link>

            <Link href="/will" className="group relative rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800">
              <div>
                <div className="rounded-lg inline-flex p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 mb-3">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h4 className="text-base font-medium text-gray-900 dark:text-white mb-1">View Will</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Review your current will</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {!isLoading && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Assets */}
          <div className="bg-white shadow rounded-lg dark:bg-gray-800">
            <div className="px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Assets</h3>
                <Link href="/assets" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {assets?.data && assets.data.length > 0 ? (
                  assets.data.slice(0, 3).map((asset: any) => (
                    <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900/20">
                          <BuildingOfficeIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{asset.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{asset.assetType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(asset.value, 'EUR')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400 mt-2">No assets yet</p>
                    <Link href="/assets/create" className="text-blue-600 hover:text-blue-500 text-sm mt-1 inline-block">
                      Add your first asset
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Beneficiaries */}
          <div className="bg-white shadow rounded-lg dark:bg-gray-800">
            <div className="px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Beneficiaries</h3>
                <Link href="/beneficiaries" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {beneficiaries?.data && beneficiaries.data.length > 0 ? (
                  beneficiaries.data.slice(0, 3).map((beneficiary: any) => (
                    <div key={beneficiary.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="rounded-full p-2 bg-green-100 dark:bg-green-900/20">
                          <UserGroupIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{beneficiary.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{beneficiary.relationshipType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Added
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400 mt-2">No beneficiaries yet</p>
                    <Link href="/beneficiaries/create" className="text-blue-600 hover:text-blue-500 text-sm mt-1 inline-block">
                      Add your first beneficiary
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white shadow rounded-lg dark:bg-gray-800">
            <div className="px-6 py-5">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg dark:bg-gray-800">
            <div className="px-6 py-5">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardClient() {
  return (
    <ClientQueryWrapper
      fallback={
        <div className="space-y-8">
          <div className="bg-white shadow rounded-lg dark:bg-gray-800">
            <div className="px-6 py-5">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white shadow rounded-lg dark:bg-gray-800">
                <div className="px-4 py-5 sm:p-6">
                  <div className="animate-pulse">
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <DashboardContent />
    </ClientQueryWrapper>
  )
}