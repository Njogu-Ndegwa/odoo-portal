import Link from 'next/link'
import Logo from '@/components/ui/logo'
import { useTranslations } from 'next-intl'

export default function OnboardingHeader() {
  const t = useTranslations('onboarding')
  const tAuth = useTranslations('auth')

  return (
    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
      <Logo />
      <div className="text-sm">
        {t('haveAccount')} <Link className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400" href="/signin">{tAuth('signIn')}</Link>
      </div>
    </div>
  )
}
