import { createFileRoute } from '@tanstack/react-router'
import { WorkspaceDetail } from '../components/workspace/workspace-detail'

export const Route = createFileRoute('/workspaces/$id')({
  component: WorkspaceDetail,
})