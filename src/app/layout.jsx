/* eslint-disable react-refresh/only-export-components */
import '@/index.css'
import { AppLayout } from '@/app/layouts/AppLayout'
import { NextProviders } from '@/app/NextProviders'

export const metadata = {
  title: 'Stratus Spoon',
  description: 'A modern kitchen for discovering, saving, and creating recipes.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <NextProviders>
          <AppLayout>{children}</AppLayout>
        </NextProviders>
      </body>
    </html>
  )
}
