'use client'

import dynamic from 'next/dynamic'
import AngelLogo from '@/components/AngelLogo'
import { useTranslations } from 'next-intl'
import { motion, useReducedMotion, type Transition } from 'framer-motion'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { ssr: false })

export default function LoginPage() {
  const t = useTranslations('auth')
  const prefersReduced = useReducedMotion()

  const logoVariants = prefersReduced
    ? { initial: {}, animate: {} }
    : {
        initial: { rotateY: -180, scale: 0.3, opacity: 0 },
        animate: { rotateY: 0, scale: 1, opacity: 1 },
      }

  const logoTransition: Transition = prefersReduced
    ? {}
    : {
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        rotateY: { duration: 0.8, ease: 'easeOut' },
        scale: { duration: 0.9, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] },
        opacity: { duration: 0.4 },
      }

  const cardVariants = prefersReduced
    ? { initial: {}, animate: {} }
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }

  const cardTransition: Transition = prefersReduced
    ? {}
    : { delay: 0.5, duration: 0.5, ease: 'easeOut' }

  async function handleGoogleLogin() {
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      toast.error(t('googleDemoNotice'))
      return
    }
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  function handleDemo() {
    document.cookie = 'mock_bypass=true; path=/; max-age=86400'
    window.location.href = '/app/stratos'
  }

  return (
    <>
      <ThreeBackground />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm glass border border-neon-blue/30 p-8">
          <motion.div
            initial={logoVariants.initial}
            animate={logoVariants.animate}
            transition={logoTransition}
            style={{ perspective: 800 }}
            className="flex justify-center mb-6"
          >
            <AngelLogo size="footer" />
          </motion.div>

          <motion.div
            initial={cardVariants.initial}
            animate={cardVariants.animate}
            transition={cardTransition}
            className="space-y-6"
          >
            <div className="text-center space-y-1">
              <h1 className="font-bold text-white" style={{ fontSize: 'var(--fs-page)' }}>
                {t('loginTitle')}<span className="text-neon-blue">.</span>
              </h1>
              <p className="text-sm text-white/50">{t('loginTagline')}</p>
            </div>

            {/* Demo bypass — primary CTA */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleDemo}
                className="w-full py-3 border-2 border-neon-blue text-white font-semibold uppercase tracking-wider text-sm overflow-hidden relative hover:text-black motion-reduce:hover:text-white transition-all duration-300 group"
              >
                <span className="absolute inset-0 bg-neon-blue transform scale-x-0 group-hover:scale-x-100 motion-reduce:hidden transition-transform duration-300 origin-left" />
                <span className="relative z-10">{t('enterDemo')}</span>
              </button>
              <p className="text-xs text-white/40 text-center">{t('demoHint')}</p>
              <p className="mt-3 text-xs text-white/40 text-center font-mono tracking-wide">
                {t('demoSession')}
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-white/30">{t('or')}</span>
              </div>
            </div>

            {/* Google sign-in — secondary */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-white/20 text-white/70 text-sm hover:border-white/40 hover:text-white transition-all duration-200"
            >
              <span>{t('continueGoogle')}</span>
            </button>
          </motion.div>
        </div>
      </div>
    </>
  )
}
