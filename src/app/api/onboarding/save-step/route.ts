import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { step, data } = await request.json()

    // Basic validation
    if (typeof step !== 'number' || step < 0 || step > 3) {
      return NextResponse.json({ error: 'Invalid step' }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Data is required' }, { status: 400 })
    }

    // For now, we'll just return success
    // In a real implementation, you would save the data to your database
    console.log(`Saving onboarding step ${step} for user ${session.user.id}:`, data)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return NextResponse.json({ 
      success: true, 
      step, 
      message: 'Step data saved successfully' 
    })

  } catch (error) {
    console.error('Error saving onboarding step:', error)
    return NextResponse.json(
      { error: 'Failed to save step data' },
      { status: 500 }
    )
  }
}