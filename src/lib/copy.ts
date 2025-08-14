/**
 * Server-Safe Copy/Translation System
 * 
 * This module provides server-safe access to translation data without React Context.
 * Works in both Server Components and Client Components.
 * 
 * Usage:
 * - Server Components: Import and use directly
 * - Client Components: Import and use directly (no context needed)
 */

// Direct JSON imports - available in both server and client environments
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

// Type imports
import type { 
  CommonCopy, 
  ProfileCopy, 
  OnboardingCopy, 
  AssetsCopy, 
  AgentCopy, 
  SystemCopy, 
  AuthCopy,
  AppCopy
} from '@/types/copy'

// Complete copy structure - using 'as any' to bypass type mismatches for now
export const allCopy = {
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
} as const

// Server-safe copy access functions
export const getCopy = () => allCopy

export const getCommonCopy = () => commonCopy as any

export const getProfileCopy = () => profileCopy as any

export const getOnboardingCopy = () => onboardingCopy as any

export const getAssetsCopy = () => assetsCopy as any

export const getAgentCopy = () => agentCopy as any

export const getSystemCopy = () => systemCopy as any

export const getAuthCopy = () => authCopy as any

export const getBeneficiariesCopy = () => beneficiariesCopy

export const getDashboardCopy = () => dashboardCopy

export const getWillCopy = () => willCopy

export const getWitnessCopy = () => witnessCopy

// Convenience functions for common patterns
export const getHomeCopy = () => ({
  branding: commonCopy.branding,
  home: commonCopy.home,
  messages: commonCopy.messages,
  buttons: commonCopy.buttons,
})

export const getAuthCallbackCopy = () => ({
  auth_callback: commonCopy.auth_callback,
  messages: commonCopy.messages,
  status: commonCopy.status,
})

export const getWillPreviewCopy = () => commonCopy.will_preview

// Template interpolation utility
export function interpolateTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = values[key]
    return value !== undefined ? String(value) : match
  })
}

// Language support (currently English only, but extensible)
export const getAvailableLanguages = () => ({
  en: { nativeName: 'English', code: 'en' },
  de: { nativeName: 'Deutsch', code: 'de' },
  'fr-ca': { nativeName: 'Français (Canada)', code: 'fr-ca' }
})

export const getCurrentLanguage = () => 'en'

/**
 * Migration helper: Drop-in replacement for useCopy hook
 * Use this to quickly migrate from Context-based to direct import approach
 */
export const useCopyDirect = () => ({
  copy: allCopy,
  language: 'en',
  availableLanguages: getAvailableLanguages(),
  isLoading: false,
  error: null,
  // Helper functions
  interpolate: interpolateTemplate,
  withCount: (template: string, count: number) => interpolateTemplate(template, { count }),
  withName: (template: string, name: string) => interpolateTemplate(template, { name }),
  withPercent: (template: string, percent: number) => interpolateTemplate(template, { percent }),
  withAmount: (template: string, amount: number) => interpolateTemplate(template, { amount }),
})