import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Providers from '@/components/provider/Providers'
import { ToastContainer } from 'react-toastify'
import localFont from 'next/font/local'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

const dune = localFont({
  src: [
    {
      path: '../public/Dune_Rise.otf',
      weight: '700'
    }
  ],
  variable: '--font-dune'
})

const font2 = localFont({
  src: [
    {
      path: '../public/MillionDesign.ttf',
      weight: '700'
    }
  ],
  variable: '--font2'
})

export const metadata: Metadata = {
  title: 'SJ | LOG',
  description: ''
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dune.variable} ${font2.variable} antialiased`}
      >
        <div
          className={
            'w-screen min-h-screen flex flex-col relative bg-[#050505]'
          }
        >
          <ToastContainer />
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  )
}
