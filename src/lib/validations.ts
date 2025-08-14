import { z } from 'zod'
import { isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js'

// Irish counties for validation
const IRISH_COUNTIES = [
  'Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry', 'Donegal',
  'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry', 'Kildare', 'Kilkenny',
  'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath',
  'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Tyrone',
  'Waterford', 'Westmeath', 'Wexford', 'Wicklow'
] as const

// Asset types
const ASSET_TYPES = [
  'bank_account', 'property', 'investment', 'pension', 'insurance', 'business', 'other'
] as const

// Relationship types
const RELATIONSHIP_TYPES = [
  'spouse', 'child', 'parent', 'sibling', 'friend', 'charity', 'other'
] as const

// Signature types
const SIGNATURE_TYPES = ['drawn', 'uploaded'] as const

/**
 * Personal Information Schema
 */
export const personalInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),

  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),

  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((dateString) => {
      const date = new Date(dateString)
      return !isNaN(date.getTime())
    }, 'Please enter a valid date')
    .refine((dateString) => {
      const birthDate = new Date(dateString)
      const today = new Date()
      return birthDate < today
    }, 'Date of birth must be in the past')
    .refine((dateString) => {
      const birthDate = new Date(dateString)
      const eighteenYearsAgo = new Date()
      eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18)
      return birthDate <= eighteenYearsAgo
    }, 'You must be at least 18 years old'),

  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .refine((phone) => {
      if (phone.startsWith('+')) {
        return isValidPhoneNumber(phone)
      }
      const parsed = parsePhoneNumberFromString(phone, 'IE')
      return parsed ? parsed.isValid() : false
    }, 'Please enter a valid phone number')
    .transform((phone) => {
      if (phone.startsWith('+')) {
        const parsed = parsePhoneNumberFromString(phone)
        return parsed?.formatInternational() || phone
      }
      const parsed = parsePhoneNumberFromString(phone, 'IE')
      return parsed?.formatInternational() || phone
    }),

  addressLine1: z
    .string()
    .min(1, 'Address line 1 is required')
    .max(100, 'Address line 1 must be less than 100 characters')
    .trim(),

  addressLine2: z
    .string()
    .max(100, 'Address line 2 must be less than 100 characters')
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val),

  city: z
    .string()
    .min(1, 'City is required')
    .max(50, 'City must be less than 50 characters')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'City can only contain letters, spaces, hyphens, and apostrophes')
    .trim(),

  county: z
    .string()
    .min(1, 'County is required')
    .refine((county) => {
      return IRISH_COUNTIES.includes(county as any)
    }, `County must be one of: ${IRISH_COUNTIES.join(', ')}`),

  eircode: z
    .string()
    .min(1, 'Eircode is required')
    .refine((val) => {
      const cleaned = val.replace(/\s/g, '').toUpperCase()
      return cleaned.length === 7 || cleaned.length === 8
    }, 'Eircode must be 7 or 8 characters')
    .refine((val) => {
      const cleaned = val.replace(/\s/g, '').toUpperCase()
      return /^[A-Z0-9]+$/i.test(cleaned)
    }, 'Eircode can only contain letters and numbers')
    .transform(val => {
      const cleaned = val.toUpperCase().replace(/\s/g, '')
      if (cleaned.length === 7) {
        return cleaned.replace(/(.{3})(.{4})/, '$1 $2')
      } else {
        return cleaned.replace(/(.{4})(.{4})/, '$1 $2')
      }
    })
})

/**
 * Asset Schema
 */
export const assetSchema = z.object({
  name: z.string().min(1, 'Asset name is required').max(255),
  assetType: z.enum(ASSET_TYPES as [string, ...string[]], { message: 'Please select a valid asset type' }),
  value: z.number().min(0, 'Asset value must be positive'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  accountNumber: z.string().max(255).optional(),
  bankName: z.string().max(255).optional(),
  propertyAddress: z.string().max(1000).optional(),
})

/**
 * Beneficiary Schema
 */
export const beneficiarySchema = z.object({
  name: z.string().min(1, 'Beneficiary name is required').max(255),
  relationshipType: z.enum(RELATIONSHIP_TYPES as [string, ...string[]], { message: 'Please select a valid relationship type' }),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  
  // Address fields
  addressLine1: z.string().max(255).optional().or(z.literal('')),
  addressLine2: z.string().max(255).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  county: z.string().max(100).optional().or(z.literal('')),
  eircode: z.string().max(20).optional().or(z.literal('')),
  country: z.string().max(100).default('Ireland'),
  
  // Inheritance details
  percentage: z.number().min(0).max(100).optional(),
  conditions: z.string().max(2000).optional().or(z.literal('')),
}).transform(data => ({
  ...data,
  email: data.email === '' ? undefined : data.email,
  phone: data.phone === '' ? undefined : data.phone,
  addressLine1: data.addressLine1 === '' ? undefined : data.addressLine1,
  addressLine2: data.addressLine2 === '' ? undefined : data.addressLine2,
  city: data.city === '' ? undefined : data.city,
  county: data.county === '' ? undefined : data.county,
  eircode: data.eircode === '' ? undefined : data.eircode,
  conditions: data.conditions === '' ? undefined : data.conditions,
}))

/**
 * Signature Schema
 */
export const signatureSchema = z.object({
  name: z.string().min(1, 'Signature name is required').max(255),
  signatureType: z.enum(SIGNATURE_TYPES as [string, ...string[]], { message: 'Invalid signature type' }),
  data: z.string().min(1, 'Signature data is required'),
  metadata: z.record(z.unknown()).optional().default({}),
})

/**
 * Will Schema
 */
export const willSchema = z.object({
  title: z.string().min(1, 'Will title is required').max(255).default('Last Will and Testament'),
  willType: z.string().max(100).default('simple'),
  content: z.string().optional(),
  preferences: z.record(z.unknown()).optional().default({}),
})

// Type exports
export type PersonalInfo = z.infer<typeof personalInfoSchema>
export type AssetInput = z.infer<typeof assetSchema>
export type BeneficiaryInput = z.infer<typeof beneficiarySchema>
export type SignatureInput = z.infer<typeof signatureSchema>
export type WillInput = z.infer<typeof willSchema>

// Constants exports
export type IrishCounty = typeof IRISH_COUNTIES[number]
export type AssetType = typeof ASSET_TYPES[number]
export type RelationshipType = typeof RELATIONSHIP_TYPES[number]
export type SignatureType = typeof SIGNATURE_TYPES[number]

export { IRISH_COUNTIES, ASSET_TYPES, RELATIONSHIP_TYPES, SIGNATURE_TYPES }