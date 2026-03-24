import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, MapPin, Phone, Clock, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
import { restaurantApi } from '@/lib/api'

export default function RestaurantList() {
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => restaurantApi.getAll(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => restaurantApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] })
      toast.success('Da xoa nha hang thanh cong')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Loi khi xoa nha hang')
    },
  })

  const filteredRestaurants = restaurants?.filter((restaurant) =>
    restaurant.name.toLowerCase().includes(search.toLowerCase()) ||
    restaurant.address?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Nha hang</h2>
          <p className="text-muted-foreground">Quan ly danh sach nha hang</p>
        </div>
        <Button asChild>
          <Link to="/restaurants/new">
            <Plus className="mr-2 h-4 w-4" />
            Them nha hang
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tim kiem nha hang..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Restaurant Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : filteredRestaurants?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Khong tim thay nha hang nao</p>
            <Button asChild className="mt-4">
              <Link to="/restaurants/new">
                <Plus className="mr-2 h-4 w-4" />
                Them nha hang dau tien
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRestaurants?.map((restaurant) => (
            <Card key={restaurant._id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="line-clamp-1">{restaurant.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {restaurant.description || 'Khong co mo ta'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                {restaurant.address && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="line-clamp-2">{restaurant.address}</span>
                  </div>
                )}
                {restaurant.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{restaurant.phone}</span>
                  </div>
                )}
                {restaurant.openTime && restaurant.closeTime && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{restaurant.openTime} - {restaurant.closeTime}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link to={`/restaurants/${restaurant._id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Sua
                  </Link>
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
                        Ban co chac muon xoa nha hang "{restaurant.name}"? Hanh dong nay khong the hoan tac.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Huy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate(restaurant._id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Xoa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
