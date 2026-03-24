import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { Layout } from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import RestaurantList from '@/pages/restaurants/RestaurantList'
import RestaurantForm from '@/pages/restaurants/RestaurantForm'
import TableList from '@/pages/tables/TableList'
import MenuList from '@/pages/menus/MenuList'
import ReservationList from '@/pages/reservations/ReservationList'
import InvoiceList from '@/pages/invoices/InvoiceList'
import EmployeeList from '@/pages/employees/EmployeeList'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="restaurants" element={<RestaurantList />} />
            <Route path="restaurants/new" element={<RestaurantForm />} />
            <Route path="restaurants/:id/edit" element={<RestaurantForm />} />
            <Route path="tables" element={<TableList />} />
            <Route path="menus" element={<MenuList />} />
            <Route path="reservations" element={<ReservationList />} />
            <Route path="invoices" element={<InvoiceList />} />
            <Route path="employees" element={<EmployeeList />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  )
}

export default App
