import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback,
})

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate({ to: '/dashboard', replace: true })
      } else if (event === 'SIGNED_OUT') {
        navigate({ to: '/auth', search: { mode: 'login' }, replace: true })
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [navigate])

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  )
}
