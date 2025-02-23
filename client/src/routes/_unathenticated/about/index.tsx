import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_unathenticated/about/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_unathenticated/about/"! </div>
}
