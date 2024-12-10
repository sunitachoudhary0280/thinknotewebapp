import type { Metadata } from "next";
import './globals.css'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ThinkNote',
  description: 'Your AI-Powered Voice Note Companion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className={`${inter.className} font-sans`}>{children}</body>
    </html>
  )
}

