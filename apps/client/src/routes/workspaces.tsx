import { createFileRoute } from '@tanstack/react-router'
import { WorkspaceExplorer } from '../components/workspace/workspace-explorer'

export const Route = createFileRoute('/workspaces')({
  component: WorkspaceExplorer,
})