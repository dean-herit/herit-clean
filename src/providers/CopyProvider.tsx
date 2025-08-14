'use client'

/**
 * Copy Provider for centralized copy management
 * 
 * SSR-compatible provider that loads all translations server-side
 * and enhances with client-side features
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react'
import type { PartialAppCopy, CopyComponent } from '@/types/copy'

// Static imports for all namespaces (SSR-compatible)
import commonCopy from '../../public/locales/en/common.json'
import agentCopy from '../../public/locales/en/agent.json'
import assetsCopy from '../../public/locales/en/assets.json'
import authCopy from '../../public/locales/en/auth.json'
import beneficiariesCopy from '../../public/locales/en/beneficiaries.json'
import dashboardCopy from '../../public/locales/en/dashboard.json'
import onboardingCopy from '../../public/locales/en/onboarding.json'
import profileCopy from '../../public/locales/en/profile.json'
import systemCopy from '../../public/locales/en/system.json'
import willCopy from '../../public/locales/en/will.json'
import witnessCopy from '../../public/locales/en/witness.json'

// Available languages
export const languages = {
  en: { nativeName: 'English', code: 'en' },
  de: { nativeName: 'Deutsch', code: 'de' },
  'fr-ca': { nativeName: 'Français (Canada)', code: 'fr-ca' }
} as const

export type Language = keyof typeof languages

interface CopyContextType {
  copy: PartialAppCopy
  language: string
  setLanguage: (language: string) => void
  availableLanguages: typeof languages
  copyComponents: CopyComponent[]
  addCopyComponent: (component: CopyComponent) => void
  getCopyComponent: (id: string) => CopyComponent | undefined
  getTranslation: (key: string) => unknown
  loadNamespace: (namespace: string) => Promise<void>
  isLoading: boolean
  error: string | null
  loadedNamespaces: Set<string>
}

// Default context value for SSR compatibility
const defaultCopyContextValue: CopyContextType = {
  copy: {
    common: commonCopy as any,
    agent: agentCopy as any,
    assets: assetsCopy as any,
    auth: authCopy as any,
    beneficiaries: beneficiariesCopy as any,
    dashboard: dashboardCopy as any,
    onboarding: onboardingCopy as any,
    profile: profileCopy as any,
    system: systemCopy as any,
    will: willCopy as any,
    witness: witnessCopy as any
  },
  language: 'en',
  setLanguage: () => {
    console.warn('CopyContext: setLanguage called before provider initialization')
  },
  availableLanguages: languages,
  copyComponents: [],
  addCopyComponent: () => {
    console.warn('CopyContext: addCopyComponent called before provider initialization')
  },
  getCopyComponent: () => undefined,
  getTranslation: (key: string) => {
    console.warn('CopyContext: getTranslation called before provider initialization for key:', key)
    return key
  },
  loadNamespace: async () => {
    console.warn('CopyContext: loadNamespace called before provider initialization')
  },
  isLoading: false,
  error: null,
  loadedNamespaces: new Set(['common', 'agent', 'assets', 'auth', 'beneficiaries', 'dashboard', 'onboarding', 'profile', 'system', 'will', 'witness'])
}

export const CopyContext = createContext<CopyContextType>(defaultCopyContextValue)

interface CopyProviderProps {
  children: ReactNode
  defaultLanguage?: string
}

/**
 * Provider component for centralized copy management
 */
export function CopyProvider({ children, defaultLanguage = 'en' }: CopyProviderProps) {
  const [language, setLanguage] = useState<string>(defaultLanguage)
  const [copyComponents, setCopyComponents] = useState<CopyComponent[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Complete copy structure with all namespaces loaded (SSR-compatible)
  const [translatedCopy, setTranslatedCopy] = useState<PartialAppCopy>(() => {
    // All translations loaded immediately for SSR compatibility
    return {
      common: commonCopy as any,
      agent: agentCopy as any,
      assets: assetsCopy as any,
      auth: authCopy as any,
      beneficiaries: beneficiariesCopy as any,
      dashboard: dashboardCopy as any,
      onboarding: onboardingCopy as any,
      profile: profileCopy as any,
      system: systemCopy as any,
      will: willCopy as any,
      witness: witnessCopy as any,
    }
  })

  // Track loaded namespaces - all loaded by default now
  const [loadedNamespaces, setLoadedNamespaces] = useState<Set<string>>(() => {
    return new Set(['common', 'agent', 'assets', 'auth', 'beneficiaries', 'dashboard', 'onboarding', 'profile', 'system', 'will', 'witness'])
  })

  // Deep merge utility function for translation objects
  const deepMerge = useCallback((target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> => {
    const result = { ...target }
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(
          (target[key] as Record<string, unknown>) || {}, 
          source[key] as Record<string, unknown>
        )
      } else {
        result[key] = source[key]
      }
    }
    
    return result
  }, [])

  // Enhanced namespace loading for language switching (client-side enhancement)
  const loadNamespace = useCallback(async (namespace: string) => {
    // All namespaces are pre-loaded, but this provides API compatibility
    // for potential future language switching functionality
    if (loadedNamespaces.has(namespace)) {
      return
    }

    // All namespaces are pre-loaded, so this is now just a compatibility layer
    // Future: Could be used for dynamic language switching
    setIsLoading(true)
    try {
      // Mark as loaded (compatibility with existing code)
      setLoadedNamespaces(prev => new Set([...prev, namespace]))
    } catch (error) {
      setError(`Error processing namespace: ${namespace}`)
    } finally {
      setIsLoading(false)
    }
  }, [loadedNamespaces])

  // Copy component management - memoized to prevent re-renders
  const addCopyComponent = useCallback((component: CopyComponent) => {
    setCopyComponents(prev => {
      const existing = prev.find(c => c.id === component.id)
      if (existing) {
        // Update existing component
        return prev.map(c => c.id === component.id ? component : c)
      }
      // Add new component
      return [...prev, component]
    })
  }, [])

  const getCopyComponent = useCallback((id: string): CopyComponent | undefined => {
    return copyComponents.find(c => c.id === id)
  }, [copyComponents])

  // Simplified language handler (currently English-only for SSR compatibility)
  const handleLanguageChange = useCallback((newLanguage: string) => {
    // For now, we'll only support English to ensure SSR compatibility
    // Future enhancement: Add proper i18n support with SSR-compatible loading
    if (newLanguage === 'en') {
      setLanguage(newLanguage)
    }
  }, [])

  // Create getTranslation method with enhanced safety
  const getTranslation = useCallback((key: string) => {
    if (!translatedCopy || typeof translatedCopy !== 'object') {
      return {}
    }
    const result = translatedCopy[key as keyof PartialAppCopy]
    return result && typeof result === 'object' ? result : {}
  }, [translatedCopy])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<CopyContextType>(() => ({
    copy: translatedCopy,
    language,
    setLanguage: handleLanguageChange,
    availableLanguages: languages,
    copyComponents,
    addCopyComponent,
    getCopyComponent,
    getTranslation,
    loadNamespace,
    isLoading,
    error,
    loadedNamespaces,
  }), [translatedCopy, language, handleLanguageChange, copyComponents, addCopyComponent, getCopyComponent, getTranslation, loadNamespace, isLoading, error, loadedNamespaces])

  // SSR-compatible initialization - no client-side initialization needed
  // All translations are pre-loaded via static imports

  return (
    <CopyContext.Provider value={contextValue}>
      {children}
    </CopyContext.Provider>
  )
}

/**
 * Hook to access copy context (alternative to useCopy)
 */
export function useCopyContext() {
  const context = useContext(CopyContext)
  
  // During SSR or if provider is not properly initialized, return default context
  if (!context) {
    // Don't log warnings during SSR to prevent build issues
    if (typeof window !== 'undefined') {
      console.warn('useCopyContext: CopyContext is null, returning default values')
    }
    return defaultCopyContextValue
  }
  
  return context
}

/**
 * Hook for accessing specific namespaces (simplified for pre-loaded content)
 * All namespaces are pre-loaded, so this always returns loaded state
 */
export function useCopyNamespaces(namespaces: string[]) {
  const { copy, isLoading, loadedNamespaces } = useCopyContext()

  // All namespaces are pre-loaded, so they're always available
  const allLoaded = true
  const anyLoading = isLoading

  return {
    copy,
    isLoading: anyLoading,
    allLoaded,
    loadedNamespaces: Array.from(loadedNamespaces),
  }
}