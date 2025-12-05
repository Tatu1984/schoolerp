import './globals.css'
import Providers from '@/components/Providers'

export const metadata = {
  title: 'School ERP System',
  description: 'Complete School Management System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
