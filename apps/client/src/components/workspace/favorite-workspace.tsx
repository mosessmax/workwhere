import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from '@tanstack/react-router'
import { trpc } from '../../utils/trpc'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import Loader from '../loader'
import { MapPin, Star, ArrowLeft } from 'lucide-react'

export function FavoriteWorkspaces() {
  const navigate = useNavigate()
  const { data: favorites, isLoading, refetch } = trpc.workspace.getFavorites.useQuery()
  
  if (isLoading) return <Loader />
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate({ to: '/workspaces' })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">My Favorite Workspaces</h1>
      </div>
      
      {!favorites?.length ? (
        <div className="text-center py-12">
          <Star className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
          <h3 className="mt-4 text-lg font-medium">No favorites yet</h3>
          <p className="mt-2 text-muted-foreground">
            Save your favorite workspaces for quick access
          </p>
          <Button 
            onClick={() => navigate({ to: '/workspaces' })}
            className="mt-4"
          >
            Browse Workspaces
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {/* {favorites.map((workspace) => ( */}
            {favorites.map((workspace: { id: string; name: string; address: string; venueType: string }) => (

            <motion.div
              key={workspace.id}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="cursor-pointer h-full" 
                onClick={() => navigate({ to: '/workspaces/$id', params: { id: workspace.id } })}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{workspace.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="h-3 w-3 mr-1" /> {workspace.address}
                      </p>
                    </div>
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full capitalize">
                      {workspace.venueType}
                    </span>
                  </div>
                  
                  <div className="mt-3">
                    <span className="inline-flex items-center text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      <Star className="h-3 w-3 mr-1 fill-yellow-500" /> Favorite
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}