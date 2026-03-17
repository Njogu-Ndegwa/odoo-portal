"use client";

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import AuthHeader from '../auth-header'
import AuthImage from '../auth-image'

export default function SignUp() {
  const t = useTranslations('auth')
  return (
    <main className="bg-white dark:bg-gray-900">

      <div className="relative md:flex">

        {/* Content */}
        <div className="md:w-1/2">
          <div className="min-h-[100dvh] h-full flex flex-col after:flex-1">

            <AuthHeader />

            <div className="max-w-sm mx-auto w-full px-4 py-8">
              <h1 className="text-3xl text-gray-800 dark:text-gray-100 font-bold mb-6">{t('createAccount')}</h1>
              {/* Form */}
              <form>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="email">{t('emailAddress')} <span className="text-red-500">*</span></label>
                    <input id="email" className="form-input w-full" type="email" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="name">{t('fullName')} <span className="text-red-500">*</span></label>
                    <input id="name" className="form-input w-full" type="text" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="role">{t('yourRole')} <span className="text-red-500">*</span></label>
                    <select id="role" className="form-select w-full">
                      <option>{t('designer')}</option>
                      <option>{t('developer')}</option>
                      <option>{t('accountant')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="password">{t('password')}</label>
                    <input id="password" className="form-input w-full" type="password" autoComplete="on" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <div className="mr-1">
                    <label className="flex items-center">
                      <input type="checkbox" className="form-checkbox" />
                      <span className="text-sm ml-2">{t('emailNewsOptIn')}</span>
                    </label>
                  </div>
                  <Link className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white ml-3 whitespace-nowrap" href="/">{t('signUp')}</Link>
                </div>
              </form>
              {/* Footer */}
              <div className="pt-5 mt-6 border-t border-gray-100 dark:border-gray-700/60">
                <div className="text-sm">
                  {t('haveAccount')} <Link className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400" href="/signin">{t('signIn')}</Link>
                </div>
              </div>
            </div>

          </div>
        </div>

        <AuthImage />

      </div>

    </main>
  )
}
