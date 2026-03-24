import { useQuery } from '@tanstack/react-query'
import { Store, CalendarCheck, Receipt, TrendingUp, Clock, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { restaurantApi, reservationApi } from '@/lib/api'

function StatCard({ title, value, description, icon: Icon, trend }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <TrendingUp className="h-3 w-3" />
            <span>{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ReservationStatusBadge({ status }) {
  const variants = {
    PENDING: 'warning',
    CONFIRMED: 'info',
    CHECKED_IN: 'success',
    COMPLETED: 'default',
    CANCELLED: 'destructive',
    NO_SHOW: 'destructive',
  }
  
  const labels = {
    PENDING: 'Cho xac nhan',
    CONFIRMED: 'Da xac nhan',
    CHECKED_IN: 'Da checkin',
    COMPLETED: 'Hoan thanh',
    CANCELLED: 'Da huy',
    NO_SHOW: 'Khong den',
  }

  return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>
}

export default function Dashboard() {
  const { data: restaurants, isLoading: loadingRestaurants } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => restaurantApi.getAll(),
  })

  const { data: reservations, isLoading: loadingReservations } = useQuery({
    queryKey: ['reservations'],
    queryFn: () => reservationApi.getAll(),
  })

  const todayReservations = reservations?.filter(r => {
    const today = new Date().toDateString()
    return new Date(r.expectedCheckinTime).toDateString() === today
  }) || []

  const pendingReservations = reservations?.filter(r => r.status === 'PENDING') || []
  const checkedInReservations = reservations?.filter(r => r.status === 'CHECKED_IN') || []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Tong quan hoat dong nha hang</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loadingRestaurants ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <StatCard
              title="Tong nha hang"
              value={restaurants?.length || 0}
              description="Dang hoat dong"
              icon={Store}
            />
            <StatCard
              title="Dat ban hom nay"
              value={todayReservations.length}
              description={`${pendingReservations.length} cho xac nhan`}
              icon={CalendarCheck}
            />
            <StatCard
              title="Khach dang dung bua"
              value={checkedInReservations.length}
              description="Dang phuc vu"
              icon={Users}
            />
            <StatCard
              title="Tong dat ban"
              value={reservations?.length || 0}
              description="Toan bo thoi gian"
              icon={Receipt}
              trend="+12% so voi thang truoc"
            />
          </>
        )}
      </div>

      {/* Recent Reservations */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Dat ban gan day
            </CardTitle>
            <CardDescription>
              Danh sach 10 dat ban moi nhat
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingReservations ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : reservations?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Chua co dat ban nao
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Khach hang</TableHead>
                    <TableHead>So dien thoai</TableHead>
                    <TableHead>Thoi gian du kien</TableHead>
                    <TableHead>Trang thai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations?.slice(0, 10).map((reservation) => (
                    <TableRow key={reservation._id}>
                      <TableCell className="font-medium">
                        {reservation.customerName}
                      </TableCell>
                      <TableCell>{reservation.customerPhone}</TableCell>
                      <TableCell>
                        {new Date(reservation.expectedCheckinTime).toLocaleString('vi-VN', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </TableCell>
                      <TableCell>
                        <ReservationStatusBadge status={reservation.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats by Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Cho xac nhan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingReservations.length}</div>
            <p className="text-xs text-muted-foreground">dat ban</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Dang phuc vu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{checkedInReservations.length}</div>
            <p className="text-xs text-muted-foreground">ban</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Hom nay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayReservations.length}</div>
            <p className="text-xs text-muted-foreground">dat ban</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
