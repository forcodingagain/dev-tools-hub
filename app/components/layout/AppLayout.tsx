import { ReactNode } from "react"
import { Header } from "./Header"
import { Footer } from "./Footer"
import { NavigationProvider } from "../../contexts/NavigationContext"

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <NavigationProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </NavigationProvider>
  )
}