import { AnimatePresence, motion } from 'framer-motion'
import { Outlet } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { Footer } from '@/components/layout/Footer'
import { MobileNavDrawer } from '@/components/layout/MobileNavDrawer'
import { Navbar } from '@/components/layout/Navbar'
import { pageTransition } from '@/utils/motion'

const MotionMain = motion.main

export function AppLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen">
      <Navbar />
      <MobileNavDrawer />
      <AnimatePresence mode="wait">
        <MotionMain
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={pageTransition}
        >
          <Outlet />
        </MotionMain>
      </AnimatePresence>
      <Footer />
    </div>
  )
}
