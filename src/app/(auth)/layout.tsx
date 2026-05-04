import ThreeBackgroundClient from '@/components/ThreeBackgroundClient'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <ThreeBackgroundClient />
      <div className="w-full max-w-sm relative z-10 animate-fade-up">{children}</div>
    </div>
  )
}
