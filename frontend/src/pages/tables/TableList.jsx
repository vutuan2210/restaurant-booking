import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Users, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { tableApi, restaurantApi } from '@/lib/api'
import { cn } from '@/lib/utils'

const tableSchema = z.object({
  number: z.coerce.number().min(1, 'So ban phai lon hon 0'),
  capacity: z.coerce.number().min(1, 'Suc chua phai lon hon 0'),
  restaurant: z.string().min(1, 'Vui long chon nha hang'),
})

const statusColors = {
  AVAILABLE: 'bg-green-500',
  BOOKED: 'bg-yellow-500',
  OCCUPIED: 'bg-red-500',
}

const statusLabels = {
  AVAILABLE: 'Trong',
  BOOKED: 'Da dat',
  OCCUPIED: 'Dang su dung',
}

function TableCard({ table, onEdit, onDelete }) {
  return (
    <Card className={cn(
      'relative overflow-hidden transition-all hover:shadow-md',
      table.status === 'OCCUPIED' && 'ring-2 ring-red-500/20'
    )}>
      <div className={cn('absolute left-0 top-0 h-full w-1', statusColors[table.status])} />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Ban {table.number}</CardTitle>
          <Badge variant={
            table.status === 'AVAILABLE' ? 'success' :
            table.status === 'BOOKED' ? 'warning' : 'destructive'
          }>
            {statusLabels[table.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{table.capacity} nguoi</span>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(table)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xac nhan xoa?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ban co chac muon xoa ban so {table.number}?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Huy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(table._id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Xoa
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TableList() {
  const [selectedRestaurant, setSelectedRestaurant] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTable, setEditingTable] = useState(null)
  const queryClient = useQueryClient()

  const { data: restaurants } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => restaurantApi.getAll().then(res => res.data),
  })

  const { data: tables, isLoading } = useQuery({
    queryKey: ['tables', selectedRestaurant],
    queryFn: () => tableApi.getAll(selectedRestaurant).then(res => res.data),
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tableSchema),
  })

  const createMutation = useMutation({
    mutationFn: (data) => tableApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      toast.success('Da them ban moi')
      closeDialog()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Loi khi them ban')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => tableApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      toast.success('Da cap nhat ban')
      closeDialog()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Loi khi cap nhat ban')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => tableApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      toast.success('Da xoa ban')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Loi khi xoa ban')
    },
  })

  const openEditDialog = (table) => {
    setEditingTable(table)
    reset({
      number: table.number,
      capacity: table.capacity,
      restaurant: table.restaurant?._id || table.restaurant,
    })
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingTable(null)
    reset({ number: '', capacity: '', restaurant: selectedRestaurant || '' })
  }

  const onSubmit = (data) => {
    if (editingTable) {
      updateMutation.mutate({ id: editingTable._id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const filteredTables = selectedRestaurant
    ? tables?.filter(t => (t.restaurant?._id || t.restaurant) === selectedRestaurant)
    : tables

  const groupedByStatus = {
    AVAILABLE: filteredTables?.filter(t => t.status === 'AVAILABLE') || [],
    BOOKED: filteredTables?.filter(t => t.status === 'BOOKED') || [],
    OCCUPIED: filteredTables?.filter(t => t.status === 'OCCUPIED') || [],
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quan ly ban</h2>
          <p className="text-muted-foreground">Quan ly ban trong nha hang</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              reset({ number: '', capacity: '', restaurant: selectedRestaurant || '' })
              setEditingTable(null)
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Them ban
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTable ? 'Sua ban' : 'Them ban moi'}</DialogTitle>
              <DialogDescription>
                {editingTable ? 'Cap nhat thong tin ban' : 'Dien thong tin de tao ban moi'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Nha hang *</Label>
                <Select
                  onValueChange={(value) => setValue('restaurant', value)}
                  defaultValue={editingTable?.restaurant?._id || selectedRestaurant}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chon nha hang" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants?.map((r) => (
                      <SelectItem key={r._id} value={r._id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.restaurant && (
                  <p className="text-sm text-destructive">{errors.restaurant.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number">So ban *</Label>
                  <Input id="number" type="number" {...register('number')} />
                  {errors.number && (
                    <p className="text-sm text-destructive">{errors.number.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Suc chua *</Label>
                  <Input id="capacity" type="number" {...register('capacity')} />
                  {errors.capacity && (
                    <p className="text-sm text-destructive">{errors.capacity.message}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Huy
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingTable ? 'Cap nhat' : 'Them moi'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter by Restaurant */}
      <div className="flex gap-4">
        <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Tat ca nha hang" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tat ca nha hang</SelectItem>
            {restaurants?.map((r) => (
              <SelectItem key={r._id} value={r._id}>{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Summary */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span className="text-sm">Trong: {groupedByStatus.AVAILABLE.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <span className="text-sm">Da dat: {groupedByStatus.BOOKED.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-sm">Dang dung: {groupedByStatus.OCCUPIED.length}</span>
        </div>
      </div>

      {/* Tables Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : filteredTables?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Chua co ban nao</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredTables?.map((table) => (
            <TableCard
              key={table._id}
              table={table}
              onEdit={openEditDialog}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
