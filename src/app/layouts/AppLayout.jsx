'use client'

import { motion } from 'framer-motion'
import { Footer } from '@/components/layout/Footer'
import { MobileNavDrawer } from '@/components/layout/MobileNavDrawer'
import { Navbar } from '@/components/layout/Navbar'
import { pageTransition } from '@/utils/motion'

const MotionMain = motion.main

export function AppLayout({ children }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <MobileNavDrawer />
      <MotionMain
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={pageTransition}
      >
        {children}
      </MotionMain>
      <Footer />
    </div>
  )
}
