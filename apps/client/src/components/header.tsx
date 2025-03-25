import { Link } from '@tanstack/react-router'
import { useAuth } from '../lib/auth-client'
import { Button } from './ui/button'
import UserMenu from './user-menu'
import { ModeToggle } from './mode-toggle'
import { MapPin, Star } from 'lucide-react'

export default function Header() {
  const { session, isAuthenticated, loading } = useAuth()

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
          {loading ? (
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
          ) : isAuthenticated ? (
            <UserMenu />
          ) : (
            <Button asChild variant="default" size="sm">
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}