import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useAuth } from '../lib/auth-client'
import { Button } from './ui/button'
import UserMenu from './user-menu'
import { ModeToggle } from './mode-toggle'
import { MapPin, Star, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header() {
  const { session, isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-bold text-lg">
            DeskDrop
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/workspaces" 
              className="flex items-center text-sm font-medium transition-colors hover:text-primary"
            >
              <MapPin className="mr-1 h-4 w-4" />
              Find Workspaces
            </Link>
            
            {isAuthenticated && (
              <Link 
                to="/favorites" 
                className="flex items-center text-sm font-medium transition-colors hover:text-primary"
              >
                <Star className="mr-1 h-4 w-4" />
                Favorites
              </Link>
            )}
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          <ModeToggle />
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
          
          <div className="hidden md:block">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <Button asChild variant="default" size="sm">
                <Link to="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link 
                to="/workspaces" 
                className="flex items-center text-sm font-medium py-2 transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MapPin className="mr-2 h-5 w-5" />
                Find Workspaces
              </Link>
              
              {isAuthenticated && (
                <Link 
                  to="/favorites" 
                  className="flex items-center text-sm font-medium py-2 transition-colors hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Star className="mr-2 h-5 w-5" />
                  Favorites
                </Link>
              )}
              
              {!isAuthenticated && (
                <Button asChild variant="default" className="w-full mt-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}