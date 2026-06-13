import { redirect } from 'next/navigation'

// Middleware already bounces unauthenticated users to /portal/login, so any
// request that reaches here is signed in.
export default function PortalIndex() {
  redirect('/portal/dashboard')
}
