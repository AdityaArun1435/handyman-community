import type { Metadata } from 'next'
import { Fraunces, IBM_Plex_Sans } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['500', '600', '700'],
})

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-plex',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'ECR Handyman',
  description: 'A community directory of handymen serving ECR, Chennai.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={fraunces.variable + ' ' + plexSans.variable}>
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
