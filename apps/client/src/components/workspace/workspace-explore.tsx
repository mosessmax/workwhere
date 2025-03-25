import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from '@tanstack/react-router'
import { trpc } from '../../utils/trpc'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { Card, CardContent } from '../ui/card'
import Loader from '../loader'
import { MapPin, Wifi, Users, VolumeX, Coffee, Plus, Search } from 'lucide-react'

export function WorkspaceExplorer() {
  const navigate = useNavigate()
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [search, setSearch] = useState('')
  const [venueTypes, setVenueTypes] = useState<string[]>([])
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }, [])
  
  const { data: workspaces, isLoading } = trpc.workspace.getWorkspaces.useQuery(
    {
      latitude: location?.lat,
      longitude: location?.lng,
      radius: 10, // 10km radius
      venueTypes: venueTypes.length > 0 ? venueTypes as any[] : undefined,
    },
    {
      enabled: !!location,
    }
  )
  
  const { data: searchResults, isLoading: isSearching } = trpc.workspace.searchWorkspaces.useQuery(
    { query: search },
    { enabled: search.length > 2 }
  )
  
  const displayedWorkspaces = search.length > 2 ? searchResults : workspaces
  
  const handleVenueTypeChange = (type: string) => {
    setVenueTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    )
  }
  
  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Find Workspaces</h1>
          <Button onClick={() => navigate({ to: '/workspaces/new' })}>
            <Plus className="mr-2 h-4 w-4" /> Add Workspace
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name or address"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {['cafe', 'library', 'coworking', 'other'].map(type => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`filter-${type}`}
                  checked={venueTypes.includes(type)}
                  onCheckedChange={() => handleVenueTypeChange(type)}
                />
                <Label htmlFor={`filter-${type}`} className="capitalize">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      
      {isLoading ? (
        <Loader />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {!displayedWorkspaces?.length ? (
            <p className="col-span-full text-center py-8 text-muted-foreground">
              {search.length > 2 
                ? "No workspaces found matching your search" 
                : "No workspaces found in this area"}
            </p>
          ) : (
            // displayedWorkspaces?.map((workspace) => (
                displayedWorkspaces?.map((workspace: { id: string; name: string; address: string; venueType: string; amenities?: any }) => (
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
                    
                    {workspace.amenities && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {workspace.amenities.wifi && (
                          <span className="inline-flex items-center text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            <Wifi className="h-3 w-3 mr-1" /> WiFi
                          </span>
                        )}
                        {workspace.amenities.coffee && (
                          <span className="inline-flex items-center text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                            <Coffee className="h-3 w-3 mr-1" /> Coffee
                          </span>
                        )}
                        {workspace.amenities.quietEnvironment && (
                          <span className="inline-flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            <VolumeX className="h-3 w-3 mr-1" /> Quiet
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </div>
  )
}