import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withApiHandler,
  getSchoolFilter,
  successResponse,
  AuthenticatedSession,
} from '@/lib/api-utils'

export const GET = withApiHandler(
  async (request: NextRequest, _context, session: AuthenticatedSession | null) => {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || 'today'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const schoolFilter = getSchoolFilter(session)

    // Calculate date range
    let dateFilter: { gte?: Date; lte?: Date } = {}
    const now = new Date()

    if (startDate && endDate) {
      dateFilter.gte = new Date(startDate)
      dateFilter.lte = new Date(endDate)
    } else {
      switch (range) {
        case 'today':
          dateFilter.gte = new Date(now.setHours(0, 0, 0, 0))
          dateFilter.lte = new Date(now.setHours(23, 59, 59, 999))
          break
        case 'week':
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          dateFilter.gte = weekAgo
          break
        case 'month':
          const monthAgo = new Date()
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          dateFilter.gte = monthAgo
          break
        case 'year':
          const yearAgo = new Date()
          yearAgo.setFullYear(yearAgo.getFullYear() - 1)
          dateFilter.gte = yearAgo
          break
      }
    }

    const where: any = {
      orderDate: dateFilter,
    }

    // Filter by school through student relationship
    if (schoolFilter.schoolId) {
      where.student = {
        schoolId: schoolFilter.schoolId,
      }
    }

    // Fetch all necessary data in parallel
    const [
      orders,
      ordersByStatus,
      ordersByMenuItem,
      dailySales,
    ] = await Promise.all([
      // Total orders and revenue
      prisma.canteenOrder.findMany({
        where,
        select: {
          totalAmount: true,
          status: true,
        },
      }),

      // Orders by status
      prisma.canteenOrder.groupBy({
        by: ['status'],
        where,
        _count: {
          id: true,
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // Popular items
      prisma.canteenOrderItem.groupBy({
        by: ['menuItemId'],
        where: {
          order: where,
        },
        _sum: {
          quantity: true,
          price: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 10,
      }),

      // Daily sales (last 30 days)
      prisma.canteenOrder.groupBy({
        by: ['orderDate'],
        where: {
          ...where,
          orderDate: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
        _sum: {
          totalAmount: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          orderDate: 'asc',
        },
      }),
    ])

    // Calculate total revenue and order count
    const totalRevenue = orders.reduce((sum: number, order: { totalAmount: number }) => sum + order.totalAmount, 0)
    const totalOrders = orders.length

    // Get menu item details for popular items
    const menuItemIds = ordersByMenuItem.map((item: { menuItemId: string }) => item.menuItemId)
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: {
          in: menuItemIds,
        },
      },
      select: {
        id: true,
        name: true,
        category: true,
        price: true,
      },
    })

    const popularItems = ordersByMenuItem.map((item: { menuItemId: string; _sum: { quantity: number | null; price: number | null } }) => {
      const menuItem = menuItems.find((m: { id: string; name: string; category: string; price: number }) => m.id === item.menuItemId)
      return {
        menuItem,
        totalQuantity: item._sum.quantity || 0,
        totalRevenue: item._sum.price || 0,
      }
    })

    // Format daily sales
    const formattedDailySales = dailySales.map((day: { orderDate: Date; _sum: { totalAmount: number | null }; _count: { id: number } }) => ({
      date: day.orderDate,
      revenue: day._sum.totalAmount || 0,
      orders: day._count.id,
    }))

    // Calculate status breakdown
    const statusBreakdown = ordersByStatus.map((item: { status: string; _count: { id: number }; _sum: { totalAmount: number | null } }) => ({
      status: item.status,
      count: item._count.id,
      revenue: item._sum.totalAmount || 0,
    }))

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    const reports = {
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        period: range,
        startDate: dateFilter.gte,
        endDate: dateFilter.lte,
      },
      statusBreakdown,
      popularItems,
      dailySales: formattedDailySales,
    }

    return successResponse(reports)
  },
  { requireAuth: true, module: 'canteen' }
)
