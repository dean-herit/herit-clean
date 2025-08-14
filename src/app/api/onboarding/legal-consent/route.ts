import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/db/db'
import { users, auditEvents } from '@/db/schema'
import { eq } from 'drizzle-orm'

interface LegalConsentData {
  consents: string[]
  timestamp: string
  userAgent?: string
}

interface LegalDisclaimer {
  id: string
  title: string
  content: string
  required: boolean
  category: string
  version: string
}

// Legal disclaimers as per LEGACY_CODE_ARCHIVE requirements
const LEGAL_DISCLAIMERS: LegalDisclaimer[] = [
  {
    id: 'terms_of_service',
    title: 'Terms of Service',
    content: `
**Herit Terms of Service**

By using Herit's will creation and estate planning services, you agree to the following terms:

1. **Service Description**: Herit provides technology-assisted will creation and estate planning tools. Our service is not a substitute for legal advice from a qualified attorney.

2. **User Responsibilities**: You are responsible for providing accurate and complete information. You must review all generated documents carefully before execution.

3. **Legal Compliance**: You confirm that you are at least 18 years old and have the legal capacity to create a will in your jurisdiction.

4. **Document Accuracy**: While we strive for accuracy, you should have your will reviewed by a qualified legal professional before execution.

5. **Limitation of Liability**: Herit's liability is limited to the fees paid for our services. We are not responsible for any legal consequences arising from the use of our documents.

6. **Privacy**: Your information is protected according to our Privacy Policy and applicable data protection laws.

7. **Modifications**: We may update these terms from time to time. Continued use constitutes acceptance of updated terms.

By proceeding, you acknowledge that you have read, understood, and agree to these terms.`,
    required: true,
    category: 'legal',
    version: '1.0'
  },
  {
    id: 'privacy_policy',
    title: 'Privacy Policy',
    content: `
**Privacy Policy**

Herit is committed to protecting your privacy and personal information.

**Information We Collect:**
- Personal details provided during onboarding
- Digital signatures and identity verification data
- Estate planning information and preferences
- Usage data and technical information

**How We Use Your Information:**
- To provide will creation and estate planning services
- To verify your identity as required by law
- To communicate with you about our services
- To improve our platform and user experience

**Data Protection:**
- All data is encrypted in transit and at rest
- We use industry-standard security measures
- Identity verification is processed through secure third-party providers
- We never sell your personal information

**Your Rights:**
- Access to your personal data
- Correction of inaccurate information
- Deletion of your data (subject to legal requirements)
- Data portability where applicable

**Data Retention:**
- Personal information is retained as long as necessary for service provision
- Legal documents may be retained for longer periods as required by law
- You may request deletion subject to legal and regulatory requirements

**Contact Us:**
For privacy-related questions, contact us at privacy@herit.com

This policy complies with GDPR, CCPA, and other applicable privacy laws.`,
    required: true,
    category: 'privacy',
    version: '1.0'
  },
  {
    id: 'will_creation_disclaimer',
    title: 'Will Creation Legal Disclaimer',
    content: `
**Important Legal Disclaimer - Will Creation**

**⚠️ IMPORTANT NOTICE - PLEASE READ CAREFULLY**

Herit provides technology tools to assist in will creation. This service does not constitute legal advice, and Herit is not a law firm.

**Legal Advice Recommendation:**
We strongly recommend that you consult with a qualified attorney in your jurisdiction before executing any will or estate planning documents created through our platform.

**Your Responsibilities:**
- Ensure all information provided is accurate and complete
- Review all generated documents thoroughly
- Understand the legal implications of your estate planning decisions
- Comply with execution requirements in your jurisdiction
- Keep your will updated as circumstances change

**Limitations:**
- Our service may not address complex estate planning needs
- Laws vary by jurisdiction and may affect document validity
- We cannot provide legal advice on specific situations
- Some estate planning strategies require attorney involvement

**Document Execution:**
- Wills must be properly executed according to local laws
- Witness and notarization requirements vary by jurisdiction
- Improper execution may render your will invalid

**Updates and Changes:**
- Estate planning should be reviewed regularly
- Major life events may require will updates
- Legal requirements may change over time

By proceeding, you acknowledge that:
- You understand these limitations
- You will seek legal advice if needed
- You are responsible for proper document execution
- You understand the importance of keeping estate planning current`,
    required: true,
    category: 'legal_disclaimer',
    version: '1.0'
  },
  {
    id: 'gdpr_consent',
    title: 'GDPR Data Processing Consent',
    content: `
**GDPR Data Processing Consent**

Under the General Data Protection Regulation (GDPR), we need your explicit consent to process your personal data.

**Consent for Data Processing:**
I consent to Herit processing my personal data including:
- Identity and contact information
- Financial and asset information
- Digital signatures and biometric data
- Estate planning preferences and decisions

**Lawful Basis for Processing:**
- Consent for estate planning services
- Legitimate interests for service improvement
- Legal obligations for identity verification
- Contract performance for service delivery

**International Data Transfers:**
Some data processing may involve transfers outside the EU/EEA. We ensure adequate protection through:
- Standard Contractual Clauses
- Adequacy decisions
- Appropriate safeguards

**Your Rights Under GDPR:**
- Right to access your data
- Right to rectification
- Right to erasure ("right to be forgotten")
- Right to restrict processing
- Right to data portability
- Right to object to processing
- Right to withdraw consent

**Data Protection Officer:**
For GDPR-related questions, contact our Data Protection Officer at dpo@herit.com

**Withdrawal of Consent:**
You may withdraw this consent at any time, though this may affect our ability to provide services.`,
    required: true,
    category: 'gdpr',
    version: '1.0'
  },
  {
    id: 'identity_verification_consent',
    title: 'Identity Verification Consent',
    content: `
**Identity Verification Consent**

To comply with legal requirements and ensure the security of our platform, we require identity verification.

**Verification Process:**
- Document scanning (passport, driver's license, or national ID)
- Biometric verification (facial recognition)
- Liveness detection to prevent fraud
- Data verification through trusted third parties

**Third-Party Verification:**
We use Stripe Identity for secure verification processing. By consenting, you agree to:
- Stripe's processing of your identity documents
- Biometric data collection and analysis
- Data sharing between Herit and Stripe for verification purposes

**Data Security:**
- All verification data is encrypted
- Documents are processed in secure environments
- Biometric data is not stored permanently
- Verification results are retained for compliance purposes

**Legal Requirements:**
Identity verification helps us:
- Prevent fraud and identity theft
- Comply with anti-money laundering regulations
- Ensure document authenticity
- Protect all users of our platform

**Your Rights:**
- You may request copies of verification data
- You can ask questions about the verification process
- You may request deletion subject to legal requirements

**Verification Failure:**
If verification fails, we may:
- Request additional documentation
- Suggest alternative verification methods
- Be unable to provide certain services

By consenting, you authorize the collection and processing of identity verification data as described above.`,
    required: true,
    category: 'verification',
    version: '1.0'
  }
]

// GET - Retrieve legal disclaimers
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's current consent status
    const user = await db.select({
      legalConsents: users.legalConsents,
      legalConsentCompleted: users.legalConsentCompleted,
      legalConsentCompletedAt: users.legalConsentCompletedAt
    })
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

    const userConsents = user.length > 0 ? user[0].legalConsents : null

    return NextResponse.json({
      success: true,
      disclaimers: LEGAL_DISCLAIMERS,
      userConsents: userConsents,
      completed: user.length > 0 ? user[0].legalConsentCompleted : false,
      completedAt: user.length > 0 ? user[0].legalConsentCompletedAt : null
    })

  } catch (error) {
    console.error('Error fetching legal disclaimers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch legal disclaimers' },
      { status: 500 }
    )
  }
}

// POST - Save legal consent
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const consentData: LegalConsentData = await request.json()

    // Validation
    if (!Array.isArray(consentData.consents) || consentData.consents.length === 0) {
      return NextResponse.json({ 
        error: 'Consents array is required and cannot be empty' 
      }, { status: 400 })
    }

    if (!consentData.timestamp) {
      return NextResponse.json({ 
        error: 'Timestamp is required' 
      }, { status: 400 })
    }

    // Validate that all required consents are provided
    const requiredConsents = LEGAL_DISCLAIMERS.filter(d => d.required).map(d => d.id)
    const missingConsents = requiredConsents.filter(id => !consentData.consents.includes(id))

    if (missingConsents.length > 0) {
      return NextResponse.json({ 
        error: 'Missing required consents',
        missingConsents 
      }, { status: 400 })
    }

    // Get client info for audit trail
    const ipAddress = request.ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Create consent record
    const consentRecord = {
      consents: consentData.consents,
      timestamp: consentData.timestamp,
      ipAddress,
      userAgent,
      disclaimerVersions: LEGAL_DISCLAIMERS.reduce((acc, disclaimer) => {
        if (consentData.consents.includes(disclaimer.id)) {
          acc[disclaimer.id] = disclaimer.version
        }
        return acc
      }, {} as Record<string, string>),
      completedDuringOnboarding: true
    }

    // Update user record
    await db.update(users)
      .set({
        legalConsents: consentRecord,
        legalConsentCompleted: true,
        legalConsentCompletedAt: new Date(),
        onboardingCurrentStep: 'verification',
        updatedAt: new Date()
      })
      .where(eq(users.email, session.user.email))

    // Create audit event
    await db.insert(auditEvents).values({
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: session.user.email,
      eventType: 'onboarding',
      eventAction: 'legal_consent_completed',
      resourceType: 'legal_consent',
      resourceId: session.user.email,
      eventData: {
        consentsCount: consentData.consents.length,
        consents: consentData.consents,
        requiredConsentsCount: requiredConsents.length,
        allRequiredProvided: missingConsents.length === 0,
        disclaimerVersions: consentRecord.disclaimerVersions
      },
      ipAddress,
      userAgent,
      eventTime: new Date()
    })

    return NextResponse.json({
      success: true,
      message: 'Legal consent saved successfully',
      nextStep: 'verification',
      consentsRecorded: consentData.consents.length
    })

  } catch (error) {
    console.error('Error saving legal consent:', error)
    return NextResponse.json(
      { error: 'Failed to save legal consent' },
      { status: 500 }
    )
  }
}