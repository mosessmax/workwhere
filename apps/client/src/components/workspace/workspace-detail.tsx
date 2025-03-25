import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from '@tanstack/react-router'
import { trpc } from '../../utils/trpc'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import Loader from '../loader'
import { 
  MapPin, Wifi, Users, VolumeX, Coffee, Star, Clock,
  Power, Utensils, ArrowLeft, Edit, Share2 
} from 'lucide-react'
import { ReportForm } from './report-form'
import { toast } from 'sonner'

export function WorkspaceDetail() {
  const { id } = useParams({ from: '/workspaces/$id' })
  const navigate = useNavigate()
  const [isReporting, setIsReporting] = useState(false)
  
  const { data: workspace, isLoading, refetch } = trpc.workspace.getWorkspace.useQuery({ id })
  const toggleFavorite = trpc.workspace.toggleFavorite.useMutation({
    onSuccess: () => {
      refetch()
      toast.success(workspace?.isFavorited 
        ? 'Removed from favorites' 
        : 'Added to favorites')
    },
  })
  
  const handleToggleFavorite = () => {
    if (!workspace) return
    toggleFavorite.mutate({ workspaceId: workspace.id })
  }
  
  if (isLoading) return <Loader />
  if (!workspace) return <div>Workspace not found</div>
  
  // report levels to visual representation
  const getCrowdLevelColor = (level: number) => {
    const levels = ['bg-green-500', 'bg-green-300', 'bg-yellow-300', 'bg-orange-400', 'bg-red-500']
    return levels[Math.floor(level) - 1] || 'bg-gray-300'
  }
  
  const getNoiseLevelColor = (level: number) => {
    const levels = ['bg-green-500', 'bg-green-300', 'bg-yellow-300', 'bg-orange-400', 'bg-red-500']
    return levels[Math.floor(level) - 1] || 'bg-gray-300'
  }
  
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
        <h1 className="text-2xl font-bold">{workspace.name}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-muted-foreground flex items-center">
                    <MapPin className="h-4 w-4 mr-2" /> {workspace.address}
                  </p>
                  <span className="mt-2 inline-block bg-primary/10 text-primary px-2 py-1 rounded-full capitalize">
                    {workspace.venueType}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleToggleFavorite}
                    disabled={toggleFavorite.isPending}
                  >
                    <Star 
                      className={`h-4 w-4 mr-2 ${workspace.isFavorited ? 'fill-yellow-400 text-yellow-400' : ''}`} 
                    />
                    {workspace.isFavorited ? 'Favorited' : 'Favorite'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href)
                      toast.success('Link copied to clipboard')
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(workspace.amenities || {}).map(([key, value]) => {
                  if (!value) return null
                  
                  let icon = null
                  switch(key) {
                    case 'wifi': icon = <Wifi className="h-4 w-4 mr-2" />; break;
                    case 'powerOutlets': icon = <Power className="h-4 w-4 mr-2" />; break;
                    case 'quietEnvironment': icon = <VolumeX className="h-4 w-4 mr-2" />; break;
                    case 'coffee': icon = <Coffee className="h-4 w-4 mr-2" />; break;
                    case 'food': icon = <Utensils className="h-4 w-4 mr-2" />; break;
                  }
                  
                  return (
                    <div key={key} className="flex items-center">
                      {icon}
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
          
          {workspace.averages && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Current Conditions</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2 flex items-center">
                      <Users className="h-4 w-4 mr-2" /> Crowd Level
                    </p>
                    <div className="flex h-2 mb-1 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`${getCrowdLevelColor(workspace.averages.crowdLevel)}`}
                        style={{ width: `${workspace.averages.crowdLevel * 20}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {workspace.averages.crowdLevel.toFixed(1)}/5
                      {workspace.averages.crowdLevel <= 2 ? ' (Not Crowded)' : 
                       workspace.averages.crowdLevel <= 3.5 ? ' (Moderately Busy)' : ' (Very Crowded)'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2 flex items-center">
                      <VolumeX className="h-4 w-4 mr-2" /> Noise Level
                    </p>
                    <div className="flex h-2 mb-1 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`${getNoiseLevelColor(workspace.averages.noiseLevel)}`}
                        style={{ width: `${workspace.averages.noiseLevel * 20}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {workspace.averages.noiseLevel.toFixed(1)}/5
                      {workspace.averages.noiseLevel <= 2 ? ' (Quiet)' : 
                       workspace.averages.noiseLevel <= 3.5 ? ' (Moderate)' : ' (Noisy)'}
                    </p>
                  </div>
                  
                  {workspace.averages.wifiSpeed && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2 flex items-center">
                        <Wifi className="h-4 w-4 mr-2" /> Wifi Speed
                      </p>
                      <p className="font-medium">
                        {workspace.averages.wifiSpeed.toFixed(1)} Mbps
                        {workspace.averages.wifiSpeed < 5 ? ' (Slow)' : 
                         workspace.averages.wifiSpeed < 20 ? ' (Decent)' : ' (Fast)'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
        
        <motion.div 
          initial={{ x: 20 }}
          animate={{ x: 0 }}
          className="space-y-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Community Reports</h3>
                <Button 
                  onClick={() => setIsReporting(true)}
                  disabled={isReporting}
                >
                  Add Report
                </Button>
              </div>
              
              {isReporting ? (
                <ReportForm 
                  workspaceId={workspace.id} 
                  onCancel={() => setIsReporting(false)}
                  onSuccess={() => {
                    setIsReporting(false)
                    refetch()
                    toast.success('Report submitted successfully')
                  }}
                />
              ) : workspace.reports && workspace.reports.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {/* {workspace.reports.map((report) => ( */}
                    {workspace.reports.map((report: { id: string; crowdLevel: string; noiseLevel: string; wifiSpeed?: number; notes?: string; reportedAt: string }) => (

                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-3"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex space-x-2">
                          <span className={`inline-block w-3 h-3 rounded-full ${getCrowdLevelColor(parseInt(report.crowdLevel))}`} />
                          <span className="text-sm">
                            Crowd: {report.crowdLevel}/5
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(report.reportedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2 mb-2">
                        <span className={`inline-block w-3 h-3 rounded-full ${getNoiseLevelColor(parseInt(report.noiseLevel))}`} />
                        <span className="text-sm">
                          Noise: {report.noiseLevel}/5
                        </span>
                      </div>
                      
                      {report.wifiSpeed && (
                        <div className="flex space-x-2 mb-2">
                          <Wifi className="h-3 w-3" />
                          <span className="text-sm">
                            WiFi: {report.wifiSpeed} Mbps
                          </span>
                        </div>
                      )}
                      
                      {report.notes && (
                        <p className="text-sm mt-2 text-muted-foreground">
                          "{report.notes}"
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-6 text-muted-foreground">
                  No reports yet. Be the first to share your experience!
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}