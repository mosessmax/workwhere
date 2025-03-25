import { useState } from 'react'
import { motion } from 'framer-motion'
import { trpc } from '../../utils/trpc'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'

type ReportFormProps = {
  workspaceId: string
  onCancel: () => void
  onSuccess: () => void
}

export function ReportForm({ workspaceId, onCancel, onSuccess }: ReportFormProps) {
  const [crowdLevel, setCrowdLevel] = useState<string>('3')
  const [noiseLevel, setNoiseLevel] = useState<string>('3')
  const [wifiSpeed, setWifiSpeed] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  
  const submitReport = trpc.workspace.submitReport.useMutation({
    onSuccess,
  })
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitReport.mutate({
      workspaceId,
      crowdLevel: crowdLevel as any,
      noiseLevel: noiseLevel as any,
      wifiSpeed: wifiSpeed ? parseFloat(wifiSpeed) : undefined,
      notes: notes || undefined,
    })
  }
  
  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="crowdLevel">Crowd Level</Label>
        <div className="flex gap-2 mt-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <Button
              key={level}
              type="button"
              variant={crowdLevel === level.toString() ? "default" : "outline"}
              onClick={() => setCrowdLevel(level.toString())}
              className="flex-1"
            >
              {level}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          1 = Empty, 5 = Very Crowded
        </p>
      </div>
      
      <div>
        <Label htmlFor="noiseLevel">Noise Level</Label>
        <div className="flex gap-2 mt-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <Button
              key={level}
              type="button"
              variant={noiseLevel === level.toString() ? "default" : "outline"}
              onClick={() => setNoiseLevel(level.toString())}
              className="flex-1"
            >
              {level}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          1 = Silent, 5 = Very Noisy
        </p>
      </div>
      
      <div>
        <Label htmlFor="wifiSpeed">WiFi Speed (Mbps, optional)</Label>
        <Input
          id="wifiSpeed"
          type="number"
          step="0.1"
          min="0"
          value={wifiSpeed}
          onChange={(e) => setWifiSpeed(e.target.value)}
          placeholder="e.g., 25.5"
        />
      </div>
      
      <div>
        <Label htmlFor="notes">Additional Notes (optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any other details about the current conditions..."
          className="resize-none"
          rows={3}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitReport.isPending}>
          {submitReport.isPending ? 'Submitting...' : 'Submit Report'}
        </Button>
      </div>
    </motion.form>
  )
}