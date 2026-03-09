import { Outlet } from 'react-router-dom'
import { Footer } from '@/components/layout/Footer'
import { MobileNavDrawer } from '@/components/layout/MobileNavDrawer'
import { Navbar } from '@/components/layout/Navbar'

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <MobileNavDrawer />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
