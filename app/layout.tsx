import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zoom Workplace | Video Conferencing',
  description:
    'A Zoom-inspired video conferencing workspace for meetings, scheduling, and collaboration.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
