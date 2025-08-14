'use client'

import { useCopyContext } from '@/providers/CopyProvider'

/**
 * Primary copy/translation hook for the application
 * 
 * Provides access to all translations and copy management functions
 */
export function useCopy() {
  const context = useCopyContext()
  
  // Create a function interface that can access nested keys
  const copyFn = (key: string, fallback?: string): string => {
    const keyParts = key.split('.')
    let value: any = context.copy
    
    for (const part of keyParts) {
      if (value && typeof value === 'object') {
        value = value[part]
      } else {
        break
      }
    }
    
    if (typeof value === 'string') {
      return value
    }
    
    return fallback || key
  }
  
  return {
    copy: copyFn,
    language: context.language,
    setLanguage: context.setLanguage,
    availableLanguages: context.availableLanguages,
    copyComponents: context.copyComponents,
    addCopyComponent: context.addCopyComponent,
    getCopyComponent: context.getCopyComponent,
    getTranslation: context.getTranslation,
    loadNamespace: context.loadNamespace,
    isLoading: context.isLoading,
    error: context.error,
    loadedNamespaces: context.loadedNamespaces
  }
}

/**
 * Alternative hook name for compatibility
 */
export const useTranslations = useCopy

/**
 * Hook for accessing specific copy namespace
 */
export function useCopyNamespace<T = any>(namespace: string): T | undefined {
  const { copy } = useCopy()
  return copy[namespace as keyof typeof copy] as T
}

/**
 * Template interpolation hook
 */
export function useInterpolation() {
  const { copy } = useCopy()
  
  const interpolate = (template: string, values: Record<string, string | number>): string => {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = values[key]
      return value !== undefined ? String(value) : match
    })
  }
  
  return {
    interpolate,
    withCount: (template: string, count: number) => interpolate(template, { count }),
    withName: (template: string, name: string) => interpolate(template, { name }),
    withPercent: (template: string, percent: number) => interpolate(template, { percent }),
    withAmount: (template: string, amount: number) => interpolate(template, { amount }),
  }
}

// Export default as useCopy for convenience
export default useCopy