import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_unathenticated/how/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_unathenticated/how_it_works/"!</div>
}
