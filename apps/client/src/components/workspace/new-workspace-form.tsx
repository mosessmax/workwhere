import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from '@tanstack/react-router'
import { trpc } from '../../utils/trpc'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Checkbox } from '../ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { toast } from 'sonner'
import { MapPin, ChevronDown, ArrowLeft } from 'lucide-react'

export function NewWorkspaceForm() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [venueType, setVenueType] = useState<string>('cafe')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(false)
  const [amenities, setAmenities] = useState({
    wifi: false,
    powerOutlets: false,
    quietEnvironment: false,
    coffee: false,
    food: false,
    outdoorSeating: false,
  })
  
  const createWorkspace = trpc.workspace.createWorkspace.useMutation({
    onSuccess: () => {
      toast.success('Workspace added successfully!')
      navigate({ to: '/workspaces' })
    },
    onError: (error) => {
      toast.error(`Failed to add workspace: ${error.message}`)
    },
  })
  
  useEffect(() => {
    if (isUsingCurrentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude)
          setLongitude(position.coords.longitude)
        },
        (error) => {
          console.error('Error getting location:', error)
          toast.error('Failed to get your current location')
          setIsUsingCurrentLocation(false)
        }
      )
    }
  }, [isUsingCurrentLocation])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!latitude || !longitude) {
      toast.error('Location coordinates are required')
      return
    }
    
    createWorkspace.mutate({
      name,
      address,
      latitude,
      longitude,
      venueType: venueType as any,
      amenities,
    })
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate({ to: '/workspaces' })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Add New Workspace</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Workspace Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Coastal Coffee Shop"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g., 123 Main St, City, State"
                  required
                />
              </div>
              
              <div>
                <Label>Type of Venue</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="capitalize">{venueType}</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {['cafe', 'library', 'coworking', 'other'].map((type) => (
                      <DropdownMenuItem
                        key={type}
                        className="capitalize"
                        onClick={() => setVenueType(type)}
                      >
                        {type}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div>
                <Label>Location</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="useCurrentLocation" 
                      checked={isUsingCurrentLocation}
                      onCheckedChange={(checked) => 
                        setIsUsingCurrentLocation(checked === true)
                      }
                    />
                    <Label htmlFor="useCurrentLocation" className="cursor-pointer">
                      Use my current location
                    </Label>
                  </div>
                  
                  {isUsingCurrentLocation ? (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {latitude && longitude 
                        ? `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                        : 'Getting your location...'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input
                          id="latitude"
                          type="number"
                          step="any"
                          value={latitude !== null ? latitude : ''}
                          onChange={(e) => setLatitude(parseFloat(e.target.value))}
                          placeholder="e.g., 40.7128"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input
                          id="longitude"
                          type="number"
                          step="any"
                          value={longitude !== null ? longitude : ''}
                          onChange={(e) => setLongitude(parseFloat(e.target.value))}
                          placeholder="e.g., -74.0060"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label>Amenities</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {Object.entries({
                    wifi: 'WiFi Available',
                    powerOutlets: 'Power Outlets',
                    quietEnvironment: 'Quiet Environment',
                    coffee: 'Coffee Available',
                    food: 'Food Available',
                    outdoorSeating: 'Outdoor Seating'
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`amenity-${key}`} 
                        checked={amenities[key as keyof typeof amenities]}
                        onCheckedChange={(checked) => 
                          setAmenities(prev => ({
                            ...prev,
                            [key]: checked === true
                          }))
                        }
                      />
                      <Label htmlFor={`amenity-${key}`} className="cursor-pointer">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate({ to: '/workspaces' })}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createWorkspace.isPending || !name || !address || !latitude || !longitude}
              >
                {createWorkspace.isPending ? 'Adding...' : 'Add Workspace'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}