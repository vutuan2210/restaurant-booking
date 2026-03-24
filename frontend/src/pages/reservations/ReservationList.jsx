import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { 
  Search, 
  CalendarDays, 
  Clock, 
  Users, 
  Phone,
  CheckCircle,
  XCircle,
  LogIn,
  LogOut,
  MoreHorizontal,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { reservationApi, restaurantApi } from '@/lib/api'
import { formatDate, formatCurrency } from '@/lib/utils'

const statusConfig = {
  PENDING: { label: 'Cho xac nhan', variant: 'warning', color: 'text-yellow-600' },
  CONFIRMED: { label: 'Da xac nhan', variant: 'info', color: 'text-blue-600' },
  CHECKED_IN: { label: 'Da checkin', variant: 'success', color: 'text-green-600' },
  COMPLETED: { label: 'Hoan thanh', variant: 'default', color: 'text-gray-600' },
  CANCELLED: { label: 'Da huy', variant: 'destructive', color: 'text-red-600' },
  NO_SHOW: { label: 'Khong den', variant: 'destructive', color: 'text-red-600' },
}

function ReservationStatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.PENDING
  return <Badge variant={config.variant}>{config.label}</Badge>
}

function ReservationDetail({ reservation, open, onClose }) {
  if (!reservation) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chi tiet dat ban</DialogTitle>
          <DialogDescription>
            Ma dat ban: {reservation._id?.slice(-8).toUpperCase()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Trang thai</span>
            <ReservationStatusBadge status={reservation.status} />
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Thong tin khach hang</h4>
            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{reservation.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{reservation.customerPhone}</span>
              </div>
              {reservation.customerEmail && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{reservation.customerEmail}</span>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Thong tin dat ban</h4>
            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(reservation.date).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{reservation.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{reservation.guests} khach</span>
              </div>
            </div>
          </div>
          {reservation.tables?.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Ban da dat</h4>
              <div className="flex flex-wrap gap-2">
                {reservation.tables.map((table, idx) => (
                  <Badge key={idx} variant="outline">
                    Ban {table.number || table}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {reservation.note && (
            <div className="space-y-2">
              <h4 className="font-medium">Ghi chu</h4>
              <p className="text-sm text-muted-foreground">{reservation.note}</p>
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Tao luc: {formatDate(reservation.createdAt)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function ReservationList() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRestaurant, setSelectedRestaurant] = useState('')
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: restaurants } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => restaurantApi.getAll(),
  })

  const { data: reservations, isLoading } = useQuery({
    queryKey: ['reservations', selectedRestaurant],
    queryFn: () => reservationApi.getAll({ restaurant: selectedRestaurant }),
  })

  const checkinMutation = useMutation({
    mutationFn: (id) => reservationApi.checkin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      toast.success('Da checkin thanh cong')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Loi khi checkin')
    },
  })

  const checkoutMutation = useMutation({
    mutationFn: (id) => reservationApi.checkout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      toast.success('Da checkout thanh cong')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Loi khi checkout')
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id) => reservationApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      toast.success('Da huy dat ban')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Loi khi huy dat ban')
    },
  })

  const filteredReservations = reservations?.filter((r) => {
    const matchesSearch = 
      r.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      r.customerPhone?.includes(search)
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const todayCount = reservations?.filter(r => {
    const today = new Date().toDateString()
    return new Date(r.expectedCheckinTime).toDateString() === today
  }).length || 0

  const pendingCount = reservations?.filter(r => r.status === 'PENDING').length || 0
  const checkedInCount = reservations?.filter(r => r.status === 'CHECKED_IN').length || 0

  const openDetail = (reservation) => {
    setSelectedReservation(reservation)
    setDetailOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Quan ly dat ban</h2>
        <p className="text-muted-foreground">Xem va quan ly cac don dat ban</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hom nay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCount}</div>
            <p className="text-xs text-muted-foreground">dat ban</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Cho xac nhan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">can xu ly</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Dang phuc vu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checkedInCount}</div>
            <p className="text-xs text-muted-foreground">khach</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tim theo ten, so dien thoai..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tat ca nha hang" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tat ca nha hang</SelectItem>
            {restaurants?.map((r) => (
              <SelectItem key={r._id} value={r._id}>{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tat ca trang thai" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tat ca trang thai</SelectItem>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sach dat ban</CardTitle>
          <CardDescription>
            Tong cong {filteredReservations?.length || 0} dat ban
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredReservations?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Khong co dat ban nao
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khach hang</TableHead>
                  <TableHead>Lien he</TableHead>
                  <TableHead>Thoi gian du kien</TableHead>
                  <TableHead>Trang thai</TableHead>
                  <TableHead className="text-right">Thao tac</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations?.map((reservation) => (
                  <TableRow key={reservation._id}>
                    <TableCell className="font-medium">
                      {reservation.customerName}
                    </TableCell>
                    <TableCell>{reservation.customerPhone}</TableCell>
                    <TableCell>
                      {new Date(reservation.date).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>{reservation.time}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {reservation.guests}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ReservationStatusBadge status={reservation.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Thao tac</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openDetail(reservation)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiet
                          </DropdownMenuItem>
                          {reservation.status === 'PENDING' && (
                            <DropdownMenuItem onClick={() => checkinMutation.mutate(reservation._id)}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                              Xac nhan
                            </DropdownMenuItem>
                          )}
                          {reservation.status === 'CONFIRMED' && (
                            <DropdownMenuItem onClick={() => checkinMutation.mutate(reservation._id)}>
                              <LogIn className="mr-2 h-4 w-4 text-blue-600" />
                              Check-in
                            </DropdownMenuItem>
                          )}
                          {reservation.status === 'CHECKED_IN' && (
                            <DropdownMenuItem onClick={() => checkoutMutation.mutate(reservation._id)}>
                              <LogOut className="mr-2 h-4 w-4 text-purple-600" />
                              Check-out
                            </DropdownMenuItem>
                          )}
                          {['PENDING', 'CONFIRMED'].includes(reservation.status) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => cancelMutation.mutate(reservation._id)}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Huy dat ban
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <ReservationDetail
        reservation={selectedReservation}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  )
}
