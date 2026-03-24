import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { restaurantApi } from '@/lib/api'

const restaurantSchema = z.object({
  name: z.string().min(1, 'Ten nha hang la bat buoc'),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email khong hop le').optional().or(z.literal('')),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
})

export default function RestaurantForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditing = Boolean(id)

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => restaurantApi.getById(id).then(res => res.data),
    enabled: isEditing,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      openTime: '',
      closeTime: '',
    },
  })

  useEffect(() => {
    if (restaurant) {
      reset({
        name: restaurant.name || '',
        description: restaurant.description || '',
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        email: restaurant.email || '',
        openTime: restaurant.openTime || '',
        closeTime: restaurant.closeTime || '',
      })
    }
  }, [restaurant, reset])

  const mutation = useMutation({
    mutationFn: (data) => {
      if (isEditing) {
        return restaurantApi.update(id, data)
      }
      return restaurantApi.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] })
      toast.success(isEditing ? 'Da cap nhat nha hang' : 'Da them nha hang moi')
      navigate('/restaurants')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Co loi xay ra')
    },
  })

  const onSubmit = (data) => {
    mutation.mutate(data)
  }

  if (isEditing && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/restaurants')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Sua nha hang' : 'Them nha hang'}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? 'Cap nhat thong tin nha hang' : 'Dien thong tin de tao nha hang moi'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Thong tin nha hang</CardTitle>
          <CardDescription>Cac truong co dau * la bat buoc</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Ten nha hang *</Label>
                <Input id="name" {...register('name')} placeholder="Nhap ten nha hang" />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">So dien thoai</Label>
                <Input id="phone" {...register('phone')} placeholder="0123 456 789" />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Dia chi</Label>
                <Input id="address" {...register('address')} placeholder="Nhap dia chi nha hang" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} placeholder="email@example.com" />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="openTime">Gio mo cua</Label>
                  <Input id="openTime" type="time" {...register('openTime')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closeTime">Gio dong cua</Label>
                  <Input id="closeTime" type="time" {...register('closeTime')} />
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Mo ta</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Mo ta ve nha hang..."
                  rows={4}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Cap nhat' : 'Them moi'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/restaurants')}>
                Huy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
