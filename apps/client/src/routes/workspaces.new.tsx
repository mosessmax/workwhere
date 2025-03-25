import { createFileRoute } from '@tanstack/react-router'
import { NewWorkspaceForm } from '../components/workspace/new-workspace-form'

export const Route = createFileRoute('/workspaces/new')({
  component: NewWorkspaceForm,
})