import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { Building2 } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="fixed inset-0 grid place-items-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background overflow-hidden">
      <div className="w-full max-w-[360px] space-y-8 p-8 border-2 border-primary/5 rounded-[2.5rem] bg-background shadow-2xl shadow-primary/5 relative">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary/10 blur-3xl rounded-full" />
        
        <div className="flex flex-col items-center text-center space-y-4 relative">
          <div className="p-4 bg-primary/10 rounded-3xl rotate-3 group-hover:rotate-0 transition-transform">
            <Building2 className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tighter text-foreground">
              Utility Bill <span className="text-primary">Manager</span>
            </h1>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              Efficient tracking for property managers
            </p>
          </div>
        </div>

        <form
          action={async () => {
            "use server"
            await signIn("google", { redirectTo: "/" })
          }}
          className="relative"
        >
          <Button 
            className="w-full h-14 text-base font-bold rounded-2xl transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] cursor-pointer gap-3 bg-primary text-primary-foreground" 
            type="submit"
          >
            <svg className="h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1(156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            Sign in with Google
          </Button>
        </form>

        <div className="text-center">
          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/50">
            Secure Enterprise Access
          </p>
        </div>
      </div>
    </div>
  )
}
