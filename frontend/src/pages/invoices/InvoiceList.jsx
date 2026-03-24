import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Receipt, Calendar, Eye, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { invoiceApi, restaurantApi } from '@/lib/api'
import { formatDate, formatCurrency } from '@/lib/utils'

const statusConfig = {
  PENDING: { label: 'Chua thanh toan', variant: 'warning' },
  PAID: { label: 'Da thanh toan', variant: 'success' },
  CANCELLED: { label: 'Da huy', variant: 'destructive' },
}

function InvoiceDetail({ invoice, open, onClose }) {
  if (!invoice) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Hoa don #{invoice._id?.slice(-8).toUpperCase()}
          </DialogTitle>
          <DialogDescription>
            Ngay tao: {formatDate(invoice.createdAt)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Trang thai</span>
            <Badge variant={statusConfig[invoice.status]?.variant || 'default'}>
              {statusConfig[invoice.status]?.label || invoice.status}
            </Badge>
          </div>

          {/* Customer Info */}
          {invoice.reservation && (
            <div className="space-y-2">
              <h4 className="font-medium">Thong tin khach hang</h4>
              <div className="rounded-lg border p-3 text-sm space-y-1">
                <p><span className="text-muted-foreground">Ten:</span> {invoice.reservation.customerName}</p>
                <p><span className="text-muted-foreground">SĐT:</span> {invoice.reservation.customerPhone}</p>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="space-y-2">
            <h4 className="font-medium">Chi tiet</h4>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mon</TableHead>
                    <TableHead className="text-center">SL</TableHead>
                    <TableHead className="text-right">Thanh tien</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items?.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.menu?.name || item.name}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency((item.menu?.price || item.price) * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Tong cong</span>
            <span className="text-primary">{formatCurrency(invoice.total)}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              In hoa don
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function InvoiceList() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRestaurant, setSelectedRestaurant] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const { data: restaurants } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => restaurantApi.getAll().then(res => res.data),
  })

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', selectedRestaurant],
    queryFn: () => invoiceApi.getAll({ restaurant: selectedRestaurant }).then(res => res.data),
  })

  const filteredInvoices = invoices?.filter((invoice) => {
    const matchesSearch = 
      invoice._id?.toLowerCase().includes(search.toLowerCase()) ||
      invoice.reservation?.customerName?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalRevenue = invoices?.filter(i => i.status === 'PAID')
    .reduce((sum, i) => sum + (i.total || 0), 0) || 0

  const openDetail = (invoice) => {
    setSelectedInvoice(invoice)
    setDetailOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Hoa don</h2>
        <p className="text-muted-foreground">Quan ly hoa don va doanh thu</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tong hoa don</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Da thanh toan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices?.filter(i => i.status === 'PAID').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tong doanh thu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tim theo ma, ten khach..."
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

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sach hoa don</CardTitle>
          <CardDescription>
            Tong cong {filteredInvoices?.length || 0} hoa don
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredInvoices?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Khong co hoa don nao
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ma hoa don</TableHead>
                  <TableHead>Khach hang</TableHead>
                  <TableHead>Ngay</TableHead>
                  <TableHead>Tong tien</TableHead>
                  <TableHead>Trang thai</TableHead>
                  <TableHead className="text-right">Thao tac</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices?.map((invoice) => (
                  <TableRow key={invoice._id}>
                    <TableCell className="font-mono text-sm">
                      #{invoice._id?.slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      {invoice.reservation?.customerName || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(invoice.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[invoice.status]?.variant || 'default'}>
                        {statusConfig[invoice.status]?.label || invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(invoice)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <InvoiceDetail
        invoice={selectedInvoice}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  )
}
