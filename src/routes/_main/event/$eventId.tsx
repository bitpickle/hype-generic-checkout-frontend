import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/event/$eventId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { eventId } = Route.useParams()
  return <div>Hello "/{eventId}"!</div>
}
