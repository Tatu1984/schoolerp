import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { expenseDate: 'desc' }
    })
    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    // Get default school if not provided
    if (!data.schoolId) {
      const defaultSchool = await prisma.school.findFirst()
      if (defaultSchool) {
        data.schoolId = defaultSchool.id
      }
    }

    const expense = await prisma.expense.create({
      data: {
        ...data,
        amount: parseFloat(data.amount),
        expenseDate: data.expenseDate ? new Date(data.expenseDate) : new Date(),
      }
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}
