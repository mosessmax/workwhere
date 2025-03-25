import { createFileRoute } from '@tanstack/react-router'
import { FavoriteWorkspaces } from '../components/workspace/favorite-workspace'

export const Route = createFileRoute('/favorites')({
  component: FavoriteWorkspaces,
})