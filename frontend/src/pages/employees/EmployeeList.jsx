import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Search, Loader2, Mail, Phone, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { employeeApi, restaurantApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

const employeeSchema = z.object({
  name: z.string().min(1, 'Ten nhan vien la bat buoc'),
  email: z.string().email('Email khong hop le').optional().or(z.literal('')),
  phone: z.string().optional(),
  role: z.string().min(1, 'Vui long chon vai tro'),
  salary: z.coerce.number().min(0, 'Luong phai lon hon hoac bang 0').optional(),
  restaurant: z.string().min(1, 'Vui long chon nha hang'),
})

const roles = [
  { value: 'manager', label: 'Quan ly' },
  { value: 'chef', label: 'Dau bep' },
  { value: 'waiter', label: 'Phuc vu' },
  { value: 'cashier', label: 'Thu ngan' },
  { value: 'receptionist', label: 'Le tan' },
  { value: 'other', label: 'Khac' },
]

const roleColors = {
  manager: 'bg-purple-500',
  chef: 'bg-orange-500',
  waiter: 'bg-blue-500',
  cashier: 'bg-green-500',
  receptionist: 'bg-pink-500',
  other: 'bg-gray-500',
}

function EmployeeCard({ employee, onEdit, onDelete }) {
  const roleLabel = roles.find(r => r.value === employee.role)?.label || employee.role
  const initials = employee.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className={roleColors[employee.role] || 'bg-gray-500'}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-1">{employee.name}</CardTitle>
            <Badge variant="outline" className="mt-1">{roleLabel}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        {employee.email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 shrink-0" />
            <span className="truncate">{employee.email}</span>
          </div>
        )}
        {employee.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4 shrink-0" />
            <span>{employee.phone}</span>
          </div>
        )}
        {employee.salary > 0 && (
          <div className="text-sm font-medium">
            Luong: {formatCurrency(employee.salary)}
          </div>
        )}
      </CardContent>
      <CardFooter className="gap-2 pt-0">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(employee)}>
          <Pencil className="mr-2 h-4 w-4" />
          Sua
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xac nhan xoa?</AlertDialogTitle>
              <AlertDialogDescription>
                Ban co chac muon xoa nhan vien "{employee.name}"?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Huy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(employee._id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Xoa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}

export default function EmployeeList() {
  const [selectedRestaurant, setSelectedRestaurant] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const queryClient = useQueryClient()

  const { data: restaurants } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => restaurantApi.getAll().then(res => res.data),
  })

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees', selectedRestaurant],
    queryFn: () => employeeApi.getAll(selectedRestaurant).then(res => res.data),
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      role: 'waiter',
    },
  })

  const createMutation = useMutation({
    mutationFn: (data) => employeeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.success('Da them nhan vien moi')
      closeDialog()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Loi khi them nhan vien')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => employeeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.success('Da cap nhat nhan vien')
      closeDialog()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Loi khi cap nhat nhan vien')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => employeeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.success('Da xoa nhan vien')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Loi khi xoa nhan vien')
    },
  })

  const openEditDialog = (employee) => {
    setEditingEmployee(employee)
    reset({
      name: employee.name,
      email: employee.email || '',
      phone: employee.phone || '',
      role: employee.role,
      salary: employee.salary || 0,
      restaurant: employee.restaurant?._id || employee.restaurant,
    })
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingEmployee(null)
    reset({ name: '', email: '', phone: '', role: 'waiter', salary: '', restaurant: selectedRestaurant || '' })
  }

  const onSubmit = (data) => {
    if (editingEmployee) {
      updateMutation.mutate({ id: editingEmployee._id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const filteredEmployees = employees?.filter((emp) => {
    const matchesSearch = emp.name?.toLowerCase().includes(search.toLowerCase())
    const matchesRole = selectedRole === 'all' || emp.role === selectedRole
    const matchesRestaurant = !selectedRestaurant || (emp.restaurant?._id || emp.restaurant) === selectedRestaurant
    return matchesSearch && matchesRole && matchesRestaurant
  })

  const employeesByRole = roles.reduce((acc, role) => {
    acc[role.value] = employees?.filter(e => e.role === role.value).length || 0
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Nhan vien</h2>
          <p className="text-muted-foreground">Quan ly nhan vien nha hang</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              reset({ name: '', email: '', phone: '', role: 'waiter', salary: '', restaurant: selectedRestaurant || '' })
              setEditingEmployee(null)
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Them nhan vien
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEmployee ? 'Sua nhan vien' : 'Them nhan vien moi'}</DialogTitle>
              <DialogDescription>
                {editingEmployee ? 'Cap nhat thong tin nhan vien' : 'Dien thong tin de tao nhan vien moi'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Nha hang *</Label>
                <Select
                  onValueChange={(value) => setValue('restaurant', value)}
                  defaultValue={editingEmployee?.restaurant?._id || selectedRestaurant}
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
              <div className="space-y-2">
                <Label htmlFor="name">Ho ten *</Label>
                <Input id="name" {...register('name')} placeholder="Nhap ho ten" />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register('email')} placeholder="email@example.com" />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">So dien thoai</Label>
                  <Input id="phone" {...register('phone')} placeholder="0123456789" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vai tro *</Label>
                  <Select
                    onValueChange={(value) => setValue('role', value)}
                    defaultValue={watch('role')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-destructive">{errors.role.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Luong (VND)</Label>
                  <Input id="salary" type="number" {...register('salary')} placeholder="0" />
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
                  {editingEmployee ? 'Cap nhat' : 'Them moi'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tong nhan vien</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees?.length || 0}</div>
          </CardContent>
        </Card>
        {roles.slice(0, 3).map((role) => (
          <Card key={role.value}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{role.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employeesByRole[role.value] || 0}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tim kiem nhan vien..."
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
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tat ca vai tro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tat ca vai tro</SelectItem>
            {roles.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Employee Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : filteredEmployees?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Chua co nhan vien nao</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredEmployees?.map((employee) => (
            <EmployeeCard
              key={employee._id}
              employee={employee}
              onEdit={openEditDialog}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
