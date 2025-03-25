import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/workspaces/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/workspaces/$id"!</div>
}
