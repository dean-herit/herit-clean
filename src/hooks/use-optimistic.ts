'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Asset, Beneficiary, Will, Signature } from '@/db/schema'
import { AssetInput, BeneficiaryInput, WillInput, SignatureInput } from '@/lib/validations'
import * as assetActions from '@/actions/assets'
import * as beneficiaryActions from '@/actions/beneficiaries'
import * as willActions from '@/actions/wills'
import * as signatureActions from '@/actions/signatures'
import * as authActions from '@/actions/auth'
import * as Sentry from '@sentry/nextjs'

// Query Keys
export const queryKeys = {
  assets: ['assets'] as const,
  asset: (id: string) => ['assets', id] as const,
  beneficiaries: ['beneficiaries'] as const,
  beneficiary: (id: string) => ['beneficiaries', id] as const,
  wills: ['wills'] as const,
  will: (id: string) => ['wills', id] as const,
  currentWill: ['wills', 'current'] as const,
  signatures: ['signatures'] as const,
  signature: (id: string) => ['signatures', id] as const,
  userProfile: ['user', 'profile'] as const,
  dashboard: ['dashboard'] as const,
}

// Asset Hooks
export function useAssets() {
  return useQuery({
    queryKey: queryKeys.assets,
    queryFn: assetActions.getAssets,
  })
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: queryKeys.asset(id),
    queryFn: () => assetActions.getAsset(id),
    enabled: !!id,
  })
}

export function useCreateAsset() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: assetActions.createAsset,
    onMutate: async (newAsset: AssetInput) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.assets })
      
      // Snapshot previous value
      const previousAssets = queryClient.getQueryData<Asset[]>(queryKeys.assets)
      
      // Optimistically update
      const optimisticAsset: Asset = {
        id: `temp-${Date.now()}`,
        userId: 'current-user',
        name: newAsset.name,
        assetType: newAsset.assetType,
        value: newAsset.value,
        description: newAsset.description || null,
        accountNumber: newAsset.accountNumber || null,
        bankName: newAsset.bankName || null,
        propertyAddress: newAsset.propertyAddress || null,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      queryClient.setQueryData<Asset[]>(queryKeys.assets, (old) => 
        old ? [optimisticAsset, ...old] : [optimisticAsset]
      )
      
      return { previousAssets }
    },
    onError: (err, newAsset, context) => {
      // Rollback on error
      if (context?.previousAssets) {
        queryClient.setQueryData(queryKeys.assets, context.previousAssets)
      }
      Sentry.captureException(err)
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.assets })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useUpdateAsset() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AssetInput }) => 
      assetActions.updateAsset(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.assets })
      await queryClient.cancelQueries({ queryKey: queryKeys.asset(id) })
      
      const previousAssets = queryClient.getQueryData<Asset[]>(queryKeys.assets)
      const previousAsset = queryClient.getQueryData<Asset>(queryKeys.asset(id))
      
      // Update in list
      queryClient.setQueryData<Asset[]>(queryKeys.assets, (old) =>
        old?.map(asset => 
          asset.id === id 
            ? { ...asset, ...input, updatedAt: new Date() }
            : asset
        )
      )
      
      // Update individual asset
      queryClient.setQueryData<Asset>(queryKeys.asset(id), (old) =>
        old ? { ...old, ...input, updatedAt: new Date() } : undefined
      )
      
      return { previousAssets, previousAsset }
    },
    onError: (err, { id }, context) => {
      if (context?.previousAssets) {
        queryClient.setQueryData(queryKeys.assets, context.previousAssets)
      }
      if (context?.previousAsset) {
        queryClient.setQueryData(queryKeys.asset(id), context.previousAsset)
      }
      Sentry.captureException(err)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useDeleteAsset() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: assetActions.deleteAsset,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.assets })
      
      const previousAssets = queryClient.getQueryData<Asset[]>(queryKeys.assets)
      
      // Remove from list
      queryClient.setQueryData<Asset[]>(queryKeys.assets, (old) =>
        old?.filter(asset => asset.id !== id)
      )
      
      return { previousAssets }
    },
    onError: (err, id, context) => {
      if (context?.previousAssets) {
        queryClient.setQueryData(queryKeys.assets, context.previousAssets)
      }
      Sentry.captureException(err)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

// Beneficiary Hooks
export function useBeneficiaries() {
  return useQuery({
    queryKey: queryKeys.beneficiaries,
    queryFn: beneficiaryActions.getBeneficiaries,
  })
}

export function useCreateBeneficiary() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: beneficiaryActions.createBeneficiary,
    onMutate: async (newBeneficiary: BeneficiaryInput) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.beneficiaries })
      
      const previousBeneficiaries = queryClient.getQueryData<Beneficiary[]>(queryKeys.beneficiaries)
      
      const optimisticBeneficiary: Beneficiary = {
        id: `temp-${Date.now()}`,
        userId: 'current-user',
        name: newBeneficiary.name,
        relationshipType: newBeneficiary.relationshipType,
        email: newBeneficiary.email || null,
        phone: newBeneficiary.phone || null,
        addressLine1: newBeneficiary.addressLine1 || null,
        addressLine2: newBeneficiary.addressLine2 || null,
        city: newBeneficiary.city || null,
        county: newBeneficiary.county || null,
        eircode: newBeneficiary.eircode || null,
        country: newBeneficiary.country,
        percentage: newBeneficiary.percentage || null,
        specificAssets: null,
        conditions: newBeneficiary.conditions || null,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      queryClient.setQueryData<Beneficiary[]>(queryKeys.beneficiaries, (old) => 
        old ? [optimisticBeneficiary, ...old] : [optimisticBeneficiary]
      )
      
      return { previousBeneficiaries }
    },
    onError: (err, newBeneficiary, context) => {
      if (context?.previousBeneficiaries) {
        queryClient.setQueryData(queryKeys.beneficiaries, context.previousBeneficiaries)
      }
      Sentry.captureException(err)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.beneficiaries })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

// Will Hooks
export function useWills() {
  return useQuery({
    queryKey: queryKeys.wills,
    queryFn: willActions.getWills,
  })
}

export function useCurrentWill() {
  return useQuery({
    queryKey: queryKeys.currentWill,
    queryFn: willActions.getCurrentWill,
  })
}

export function useCreateWill() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: willActions.createWill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wills })
      queryClient.invalidateQueries({ queryKey: queryKeys.currentWill })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
    onError: (err) => {
      Sentry.captureException(err)
    },
  })
}

// Signature Hooks
export function useSignatures() {
  return useQuery({
    queryKey: queryKeys.signatures,
    queryFn: signatureActions.getSignatures,
  })
}

export function useCreateSignature() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: signatureActions.createSignature,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.signatures })
    },
    onError: (err) => {
      Sentry.captureException(err)
    },
  })
}

// User Profile Hook
export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.userProfile,
    queryFn: authActions.getUserProfile,
  })
}

// Dashboard Hook (combines multiple queries)
export function useDashboard() {
  const assets = useAssets()
  const beneficiaries = useBeneficiaries()
  const currentWill = useCurrentWill()
  const userProfile = useUserProfile()
  
  return {
    assets,
    beneficiaries,
    currentWill,
    userProfile,
    isLoading: assets.isLoading || beneficiaries.isLoading || currentWill.isLoading || userProfile.isLoading,
    error: assets.error || beneficiaries.error || currentWill.error || userProfile.error,
  }
}