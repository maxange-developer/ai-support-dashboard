import ThreeBackgroundClient from '@/components/ThreeBackgroundClient'
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative">
      <ThreeBackgroundClient />
      <div className="fixed top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-sm relative z-10 animate-fade-up">{children}</div>
    </div>
  )
}
