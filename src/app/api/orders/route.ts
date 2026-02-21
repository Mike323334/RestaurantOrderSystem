import prisma from '../../../lib/prisma'
import { NextResponse } from 'next/server'
import { validateOrder } from '../../../lib/validation'
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit'

// ------------------- Helpers -------------------

async function verifyPayPalOrder(orderID: string, expectedTotal: string) {
  console.log('--- PayPal Verification Start ---')
  console.log('Order ID:', orderID)
  console.log('Expected Total:', expectedTotal)
  console.log('Client ID exists:', !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID)
  console.log('Client Secret exists:', !!process.env.PAYPAL_CLIENT_SECRET)

  const paypalAuthHeader = Buffer.from(
    `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  const response = await fetch(
    `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}`,
    {
      headers: {
        Authorization: `Basic ${paypalAuthHeader}`,
      },
    }
  )

  console.log('PayPal API Response Status:', response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('PayPal API request failed:', response.status, errorText)
    return null
  }

  const data = await response.json()
  console.log('PayPal Order Data:', JSON.stringify(data, null, 2))

  // Verify payment status
  if (data.status !== 'APPROVED' && data.status !== 'COMPLETED') {
    console.error('PayPal order not approved, status:', data.status)
    return null
  }

  // CRITICAL: Verify amount matches (fraud prevention)
  const paypalAmount = data.purchase_units?.[0]?.amount?.value
  console.log('PayPal Amount:', paypalAmount, 'Expected:', expectedTotal)
  
  // Compare as numbers to handle formatting differences (e.g., "10.00" vs "10")
  if (parseFloat(paypalAmount) !== parseFloat(expectedTotal)) {
    console.error('FRAUD ALERT: Amount mismatch', {
      expected: expectedTotal,
      received: paypalAmount,
    })
    return null
  }

  console.log('PayPal order verified successfully, status:', data.status)
  console.log('--- PayPal Verification End ---')
  return data
}

async function createOrderRecord({
  customerName,
  customerPhone,
  items,
  total,
  paypalOrderId,
  paypalStatus,
}: {
  customerName: string
  customerPhone: string
  items: any[]
  total: number
  paypalOrderId?: string
  paypalStatus?: string
}) {
  const order = await prisma.order.create({
    data: {
      paypalOrderId,
      paypalStatus,
      customerName,
      customerPhone,
      total,
      status: 'pending',
      items: {
        create: items.map((item) => ({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    },
    include: {
      items: true,
    },
  })

  console.log('Order created with ID:', order.id)
  return order
}

// ------------------- API Routes -------------------

export async function GET(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request)
    if (!checkRateLimit(clientIp, 30, 60000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // TODO: Add authentication for production
    // For now, only allow access from same origin
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    if (origin && !origin.includes(host || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit results
    })

    return NextResponse.json(orders)
  } catch (error: any) {
    console.error('API GET Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  console.log('--- API ORDER START ---')
  try {
    // Rate limiting
    const clientIp = getClientIp(request)
    if (!checkRateLimit(clientIp, 5, 60000)) {
      return NextResponse.json(
        { error: 'Too many order attempts. Please wait before trying again.' },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()

    // Input validation
    const validation = validateOrder(body)
    if (!validation.success) {
      console.warn('Validation failed:', validation.errors)
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.errors },
        { status: 400 }
      )
    }

    const { customerName, customerPhone, items, total, orderID } = validation.data as {
      customerName: string
      customerPhone: string
      items: any[]
      total: number
      orderID?: string
    }

    let paypalOrderData = null
    let paypalStatus = null

    // Verify PayPal order if orderID provided
    if (orderID) {
      console.log('Verifying PayPal order:', orderID)
      paypalOrderData = await verifyPayPalOrder(orderID, total.toString())

      if (!paypalOrderData) {
        return NextResponse.json(
          { error: 'PayPal payment verification failed. Please try again.' },
          { status: 400 }
        )
      }

      paypalStatus = paypalOrderData.status
    } else {
      console.warn('Order created without PayPal verification')
    }

    // Create order record in database
    console.log('Creating order record...')
    const order = await createOrderRecord({
      customerName,
      customerPhone,
      items,
      total,
      paypalOrderId: orderID,
      paypalStatus,
    })

    console.log('Order created successfully:', order.id)
    return NextResponse.json(order, { status: 201 })
  } catch (error: any) {
    console.error('!!! API POST CRITICAL ERROR !!!', error)

    // Don't expose internal error details to client
    return NextResponse.json(
      { error: 'Failed to process order. Please try again.' },
      { status: 500 }
    )
  } finally {
    console.log('--- API ORDER END ---')
  }
}
