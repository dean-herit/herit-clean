// Copy types for estate planning application
export interface CommonCopy {
  branding: {
    company_name: string
    tagline: string
  }
  home: {
    title: string
    subtitle: string
    hero_title: string
    hero_subtitle: string
  }
  messages: {
    loading: string
    error: string
    success: string
    saving: string
    saved: string
  }
  buttons: {
    continue: string
    back: string
    next: string
    save: string
    cancel: string
    submit: string
    edit: string
    delete: string
    add: string
  }
  status: {
    completed: string
    in_progress: string
    pending: string
    draft: string
    active: string
    inactive: string
  }
  auth_callback: {
    title: string
    processing: string
    success: string
    error: string
  }
  will_preview: {
    title: string
    generated_on: string
    download_pdf: string
  }
}

export interface AuthCopy {
  title: string
  subtitle: string
  email_login: {
    title: string
    email_label: string
    password_label: string
    submit_button: string
    forgot_password: string
    no_account: string
    sign_up_link: string
  }
  email_signup: {
    title: string
    email_label: string
    password_label: string
    confirm_password_label: string
    submit_button: string
    have_account: string
    sign_in_link: string
  }
  oauth: {
    google_button: string
    apple_button: string
    divider: string
  }
  errors: {
    invalid_credentials: string
    email_required: string
    password_required: string
    passwords_dont_match: string
    email_invalid: string
    password_too_short: string
  }
}

export interface OnboardingCopy {
  title: string
  subtitle: string
  steps: {
    personal_info: string
    signature: string
    legal_consent: string
    verification: string
  }
  personal_info: {
    title: string
    subtitle: string
    first_name_label: string
    last_name_label: string
    date_of_birth_label: string
    phone_number_label: string
    address_line_1_label: string
    address_line_2_label: string
    city_label: string
    county_label: string
    eircode_label: string
  }
  signature: {
    title: string
    subtitle: string
    draw_signature: string
    upload_signature: string
    signature_name_label: string
    clear_signature: string
    save_signature: string
  }
  legal_consent: {
    title: string
    subtitle: string
    sound_mind: string
    no_duress: string
    terms_of_service: string
    privacy_policy: string
    consent_required: string
  }
  verification: {
    title: string
    subtitle: string
    start_verification: string
    verification_complete: string
    verification_failed: string
  }
}

export interface AssetsCopy {
  title: string
  subtitle: string
  add_asset: string
  no_assets: string
  asset_types: {
    bank_account: string
    property: string
    investment: string
    pension: string
    insurance: string
    business: string
    other: string
  }
  form: {
    name_label: string
    type_label: string
    value_label: string
    description_label: string
    account_number_label: string
    bank_name_label: string
    property_address_label: string
  }
}

export interface BeneficiariesCopy {
  title: string
  subtitle: string
  add_beneficiary: string
  no_beneficiaries: string
  relationship_types: {
    spouse: string
    child: string
    parent: string
    sibling: string
    friend: string
    charity: string
    other: string
  }
  form: {
    name_label: string
    relationship_label: string
    email_label: string
    phone_label: string
    address_line_1_label: string
    address_line_2_label: string
    city_label: string
    county_label: string
    eircode_label: string
    country_label: string
    percentage_label: string
    conditions_label: string
  }
}

export interface DashboardCopy {
  title: string
  welcome: string
  overview: {
    total_assets: string
    total_beneficiaries: string
    will_status: string
    onboarding_progress: string
  }
  navigation: {
    dashboard: string
    assets: string
    beneficiaries: string
    wills: string
    profile: string
    settings: string
  }
}

export interface WillCopy {
  title: string
  subtitle: string
  create_will: string
  will_builder: {
    title: string
    step_1: string
    step_2: string
    step_3: string
    step_4: string
  }
  preview: {
    title: string
    download_pdf: string
    finalize_will: string
  }
}

export interface ProfileCopy {
  title: string
  personal_info: {
    title: string
    edit: string
  }
  preferences: {
    title: string
    language: string
    theme: string
  }
  security: {
    title: string
    change_password: string
    two_factor: string
  }
}

export interface SystemCopy {
  errors: {
    page_not_found: string
    server_error: string
    network_error: string
    unauthorized: string
    forbidden: string
  }
  loading: {
    page: string
    data: string
    saving: string
    processing: string
  }
}

export interface AgentCopy {
  title: string
  subtitle: string
}

export interface WitnessCopy {
  title: string
  subtitle: string
}

// Complete app copy structure
export interface AppCopy {
  common: CommonCopy
  auth: AuthCopy
  onboarding: OnboardingCopy
  assets: AssetsCopy
  beneficiaries: BeneficiariesCopy
  dashboard: DashboardCopy
  will: WillCopy
  profile: ProfileCopy
  system: SystemCopy
  agent: AgentCopy
  witness: WitnessCopy
}

// Partial app copy for dynamic loading
export type PartialAppCopy = Partial<AppCopy>

// Copy component for dynamic content
export interface CopyComponent {
  id: string
  namespace: keyof AppCopy
  content: Record<string, unknown>
  metadata?: Record<string, unknown>
}