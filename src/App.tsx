import { useState } from 'react'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Kitchen } from './components/Kitchen'
import { FloatingPlates } from './components/FloatingPlates'
import { MenuSection } from './components/MenuSection'
import { GallerySection } from './components/Gallery'
import { Reviews } from './components/Reviews'
import { Visit } from './components/Visit'
import { Footer } from './components/Footer'
import { CartDrawer } from './components/CartDrawer'
import { ReserveModal } from './components/ReserveModal'
import { ToastProvider } from './context/ToastContext'
import { CartProvider } from './context/CartContext'

function AppShell() {
  const [reserveOpen, setReserveOpen] = useState(false)

  return (
    <div className="min-h-screen bg-ink text-cream">
      <a
        href="#top"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-sq focus:bg-gold focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:text-ink"
      >
        Skip to content
      </a>

      <Nav onReserve={() => setReserveOpen(true)} />
      <main>
        <Hero />
        <About />
        <Kitchen />
        <FloatingPlates />
        <MenuSection />
        <GallerySection />
        <Reviews />
        <Visit onReserve={() => setReserveOpen(true)} />
      </main>
      <Footer />

      <CartDrawer />
      <ReserveModal open={reserveOpen} onClose={() => setReserveOpen(false)} />
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <AppShell />
      </CartProvider>
    </ToastProvider>
  )
}

export default App
