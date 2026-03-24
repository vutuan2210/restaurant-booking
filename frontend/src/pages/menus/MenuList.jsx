import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Search, Loader2, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { menuApi, restaurantApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

const menuSchema = z.object({
  name: z.string().min(1, 'Ten mon an la bat buoc'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Gia phai lon hon hoac bang 0'),
  category: z.string().optional(),
  restaurant: z.string().min(1, 'Vui long chon nha hang'),
})

const categories = [
  { value: 'appetizer', label: 'Khai vi' },
  { value: 'main', label: 'Mon chinh' },
  { value: 'soup', label: 'Sup/Canh' },
  { value: 'dessert', label: 'Trang mieng' },
  { value: 'drink', label: 'Do uong' },
  { value: 'other', label: 'Khac' },
]

function MenuCard({ item, onEdit, onDelete }) {
  const categoryLabel = categories.find(c => c.value === item.category)?.label || item.category || 'Khac'
  
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1 text-base">{item.name}</CardTitle>
          <Badge variant="secondary" className="shrink-0">{categoryLabel}</Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {item.description || 'Khong co mo ta'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-lg font-bold text-primary">{formatCurrency(item.price)}</p>
      </CardContent>
      <CardFooter className="gap-2 pt-0">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(item)}>
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
                Ban co chac muon xoa mon "{item.name}"?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Huy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(item._id)}
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

export default function MenuList() {
  const [selectedRestaurant, setSelectedRestaurant] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const queryClient = useQueryClient()

  const { data: restaurants } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => restaurantApi.getAll(),
  })

  const { data: menus, isLoading } = useQuery({
    queryKey: ['menus', selectedRestaurant],
    queryFn: () => menuApi.getAll(selectedRestaurant),
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      category: 'main',
    },
  })

  const createMutation = useMutation({
    mutationFn: (data) => menuApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
      toast.success('Da them mon an moi')
      closeDialog()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Loi khi them mon an')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => menuApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
      toast.success('Da cap nhat mon an')
      closeDialog()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Loi khi cap nhat mon an')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => menuApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
      toast.success('Da xoa mon an')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Loi khi xoa mon an')
    },
  })

  const openEditDialog = (item) => {
    setEditingItem(item)
    reset({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category || 'main',
      restaurant: item.restaurant?._id || item.restaurant,
    })
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingItem(null)
    reset({ name: '', description: '', price: '', category: 'main', restaurant: selectedRestaurant || '' })
  }

  const onSubmit = (data) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem._id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const filteredMenus = menus?.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesRestaurant = !selectedRestaurant || (item.restaurant?._id || item.restaurant) === selectedRestaurant
    return matchesSearch && matchesCategory && matchesRestaurant
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Thuc don</h2>
          <p className="text-muted-foreground">Quan ly mon an trong nha hang</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              reset({ name: '', description: '', price: '', category: 'main', restaurant: selectedRestaurant || '' })
              setEditingItem(null)
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Them mon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Sua mon an' : 'Them mon an moi'}</DialogTitle>
              <DialogDescription>
                {editingItem ? 'Cap nhat thong tin mon an' : 'Dien thong tin de tao mon an moi'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Nha hang *</Label>
                <Select
                  onValueChange={(value) => setValue('restaurant', value)}
                  defaultValue={editingItem?.restaurant?._id || selectedRestaurant}
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
                <Label htmlFor="name">Ten mon an *</Label>
                <Input id="name" {...register('name')} placeholder="Nhap ten mon an" />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Gia (VND) *</Label>
                  <Input id="price" type="number" {...register('price')} placeholder="0" />
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Danh muc</Label>
                  <Select
                    onValueChange={(value) => setValue('category', value)}
                    defaultValue={watch('category')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mo ta</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Mo ta mon an..."
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Huy
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingItem ? 'Cap nhat' : 'Them moi'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tim kiem mon an..."
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
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          <TabsTrigger value="all">Tat ca</TabsTrigger>
          {categories.map((c) => (
            <TabsTrigger key={c.value} value={c.value}>{c.label}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : filteredMenus?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UtensilsCrossed className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Chua co mon an nao</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredMenus?.map((item) => (
                <MenuCard
                  key={item._id}
                  item={item}
                  onEdit={openEditDialog}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
