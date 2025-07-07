import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pizzeria Frazione - Breuken Leren met Pizza\'s',
  description: 'Een leuk rekenspelletje om breuken te leren door pizza\'s te maken in een Italiaanse pizzeria',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className="bg-gray-100 min-h-screen" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}