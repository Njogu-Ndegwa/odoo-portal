"use client";

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import AuthHeader from '../auth-header'
import AuthImage from '../auth-image'

export default function ResetPassword() {
  const t = useTranslations('auth')
  return (
    <main className="bg-white dark:bg-gray-900">

      <div className="relative md:flex">

        {/* Content */}
        <div className="md:w-1/2">
          <div className="min-h-[100dvh] h-full flex flex-col after:flex-1">

            <AuthHeader />

            <div className="max-w-sm mx-auto w-full px-4 py-8">
              <h1 className="text-3xl text-gray-800 dark:text-gray-100 font-bold mb-6">{t('resetYourPassword')}</h1>
              {/* Form */}
              <form>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="email">{t('emailAddress')} <span className="text-red-500">*</span></label>
                    <input id="email" className="form-input w-full" type="email" />
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white whitespace-nowrap">{t('sendResetLink')}</button>
                </div>
              </form>
            </div>

          </div>
        </div>

        <AuthImage />

      </div>

    </main>
  )
}
