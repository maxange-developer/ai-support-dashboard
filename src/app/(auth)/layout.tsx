import LanguageSwitcher from '@/components/i18n/LanguageSwitcher'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="fixed top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>
      {children}
    </>
  )
}
