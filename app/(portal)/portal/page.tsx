'use client'

import Link from 'next/link'

type Applet = {
  title: string
  href: string
  gradient: string
  enabled: boolean
  icon: React.ReactNode
}

const applets: Applet[] = [
  {
    title: 'Customers',
    href: '/portal/customers',
    gradient: 'from-violet-500 to-violet-600',
    enabled: true,
    icon: (
      <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none">
        <circle cx="30" cy="15" r="6" fill="white" fillOpacity={0.45} />
        <path d="M30 24c-5.3 0-12 2.7-12 6v3h24v-3c0-3.3-6.7-6-12-6z" fill="white" fillOpacity={0.45} />
        <circle cx="19" cy="17" r="7" fill="white" />
        <path d="M19 27c-6.3 0-14 3.2-14 7v4h28v-4c0-3.8-7.7-7-14-7z" fill="white" />
      </svg>
    ),
  },
  {
    title: 'Products',
    href: '/portal/products',
    gradient: 'from-amber-400 to-amber-500',
    enabled: true,
    icon: (
      <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none">
        <path d="M24 4L6 14v20l18 10 18-10V14L24 4z" fill="white" fillOpacity={0.3} />
        <path d="M24 4L6 14l18 10 18-10L24 4z" fill="white" />
        <path d="M24 24v20l18-10V14L24 24z" fill="white" fillOpacity={0.6} />
        <path d="M24 24v20L6 34V14l18 10z" fill="white" fillOpacity={0.45} />
      </svg>
    ),
  },
  {
    title: 'Orders',
    href: '/portal/orders',
    gradient: 'from-green-500 to-green-600',
    enabled: true,
    icon: (
      <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none">
        <path d="M38 12H10c-2.2 0-4 1.8-4 4v22c0 2.2 1.8 4 4 4h28c2.2 0 4-1.8 4-4V16c0-2.2-1.8-4-4-4z" fill="white" fillOpacity={0.4} />
        <path d="M32 12V8c0-2.2-1.8-4-4-4h-8c-2.2 0-4 1.8-4 4v4" stroke="white" strokeWidth={3.5} strokeLinecap="round" />
        <rect x="14" y="21" width="14" height="3" rx="1.5" fill="white" />
        <rect x="14" y="28" width="10" height="3" rx="1.5" fill="white" fillOpacity={0.6} />
        <rect x="14" y="35" width="7" height="3" rx="1.5" fill="white" fillOpacity={0.35} />
      </svg>
    ),
  },
  {
    title: 'Sales',
    href: '#',
    gradient: 'from-emerald-500 to-emerald-600',
    enabled: false,
    icon: (
      <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="30" width="8" height="12" rx="2" fill="white" fillOpacity={0.4} />
        <rect x="17" y="22" width="8" height="20" rx="2" fill="white" fillOpacity={0.6} />
        <rect x="28" y="14" width="8" height="28" rx="2" fill="white" fillOpacity={0.8} />
        <path d="M38 6l4 0M38 6l0 4M38 6L28 16" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Accounting',
    href: '#',
    gradient: 'from-teal-500 to-teal-600',
    enabled: false,
    icon: (
      <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="6" width="36" height="36" rx="6" fill="white" fillOpacity={0.35} />
        <rect x="6" y="6" width="36" height="10" rx="4" fill="white" fillOpacity={0.7} />
        <text x="24" y="14" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" dominantBaseline="central">123</text>
        <circle cx="14" cy="25" r="3" fill="white" />
        <circle cx="24" cy="25" r="3" fill="white" fillOpacity={0.6} />
        <circle cx="34" cy="25" r="3" fill="white" fillOpacity={0.6} />
        <circle cx="14" cy="35" r="3" fill="white" fillOpacity={0.6} />
        <circle cx="24" cy="35" r="3" fill="white" fillOpacity={0.6} />
        <rect x="30" y="32" width="8" height="6" rx="3" fill="white" />
      </svg>
    ),
  },
  {
    title: 'Inventory',
    href: '#',
    gradient: 'from-orange-400 to-orange-500',
    enabled: false,
    icon: (
      <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="28" width="18" height="16" rx="3" fill="white" fillOpacity={0.5} />
        <rect x="26" y="28" width="18" height="16" rx="3" fill="white" fillOpacity={0.35} />
        <rect x="8" y="8" width="32" height="18" rx="3" fill="white" fillOpacity={0.7} />
        <path d="M8 17h32" stroke="white" strokeWidth={2} strokeOpacity={0.5} />
        <path d="M24 8v18" stroke="white" strokeWidth={2} strokeOpacity={0.3} />
        <path d="M13 28v16M35 28v16" stroke="white" strokeWidth={2} strokeOpacity={0.3} />
      </svg>
    ),
  },
  {
    title: 'Contacts',
    href: '#',
    gradient: 'from-rose-400 to-rose-500',
    enabled: false,
    icon: (
      <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="6" width="32" height="36" rx="5" fill="white" fillOpacity={0.4} />
        <circle cx="24" cy="19" r="7" fill="white" />
        <path d="M13 36c0-4.4 4.9-8 11-8s11 3.6 11 8" fill="white" fillOpacity={0.7} />
        <rect x="4" y="12" width="6" height="3" rx="1.5" fill="white" />
        <rect x="4" y="20" width="6" height="3" rx="1.5" fill="white" fillOpacity={0.6} />
        <rect x="4" y="28" width="6" height="3" rx="1.5" fill="white" fillOpacity={0.6} />
      </svg>
    ),
  },
  {
    title: 'Reports',
    href: '#',
    gradient: 'from-indigo-400 to-indigo-500',
    enabled: false,
    icon: (
      <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="4" width="28" height="40" rx="4" fill="white" fillOpacity={0.35} />
        <rect x="8" y="4" width="28" height="12" rx="4" fill="white" fillOpacity={0.5} />
        <rect x="13" y="8" width="8" height="3" rx="1.5" fill="white" />
        <rect x="13" y="24" width="18" height="2.5" rx="1.25" fill="white" fillOpacity={0.5} />
        <rect x="13" y="30" width="13" height="2.5" rx="1.25" fill="white" fillOpacity={0.4} />
        <rect x="13" y="36" width="16" height="2.5" rx="1.25" fill="white" fillOpacity={0.3} />
        <circle cx="32" cy="32" r="12" fill="white" fillOpacity={0.25} />
        <path d="M32 24v8h8" stroke="white" strokeWidth={3} strokeLinecap="round" fill="none" />
        <circle cx="32" cy="32" r="11" stroke="white" strokeWidth={2.5} fill="none" />
      </svg>
    ),
  },
  {
    title: 'Helpdesk',
    href: '#',
    gradient: 'from-yellow-400 to-yellow-500',
    enabled: false,
    icon: (
      <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none">
        <path d="M40 22c0-8.8-7.2-16-16-16S8 13.2 8 22" stroke="white" strokeWidth={4} strokeLinecap="round" />
        <rect x="4" y="22" width="10" height="14" rx="5" fill="white" fillOpacity={0.5} />
        <rect x="34" y="22" width="10" height="14" rx="5" fill="white" fillOpacity={0.5} />
        <rect x="7" y="24" width="4" height="10" rx="2" fill="white" />
        <rect x="37" y="24" width="4" height="10" rx="2" fill="white" />
        <path d="M38 36c0 4-6 7-14 7" stroke="white" strokeWidth={3} strokeLinecap="round" fillOpacity={0.6} />
      </svg>
    ),
  },
  {
    title: 'Settings',
    href: '/settings',
    gradient: 'from-gray-500 to-gray-600',
    enabled: true,
    icon: (
      <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="16" fill="white" fillOpacity={0.3} />
        <circle cx="24" cy="24" r="7" fill="white" />
        <rect x="22" y="2" width="4" height="10" rx="2" fill="white" fillOpacity={0.8} />
        <rect x="22" y="36" width="4" height="10" rx="2" fill="white" fillOpacity={0.8} />
        <rect x="2" y="22" width="10" height="4" rx="2" fill="white" fillOpacity={0.8} />
        <rect x="36" y="22" width="10" height="4" rx="2" fill="white" fillOpacity={0.8} />
        <rect x="8.2" y="8.2" width="4" height="10" rx="2" fill="white" fillOpacity={0.55} transform="rotate(45 10.2 10.2)" />
        <rect x="33.8" y="33.8" width="4" height="10" rx="2" fill="white" fillOpacity={0.55} transform="rotate(45 35.8 35.8)" />
        <rect x="33.8" y="8.2" width="4" height="10" rx="2" fill="white" fillOpacity={0.55} transform="rotate(-45 35.8 10.2)" />
        <rect x="8.2" y="33.8" width="4" height="10" rx="2" fill="white" fillOpacity={0.55} transform="rotate(-45 10.2 35.8)" />
      </svg>
    ),
  },
]

export default function PortalPage() {
  return (
    <div className="flex items-center justify-center min-h-full px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10 sm:gap-x-8 sm:gap-y-12">
          {applets.map((applet) =>
            applet.enabled ? (
              <Link
                key={applet.title}
                href={applet.href}
                className="group flex flex-col items-center gap-3 text-center"
              >
                <div
                  className={`w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-2xl bg-gradient-to-br ${applet.gradient} text-white flex items-center justify-center shadow-sm group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-200`}
                >
                  {applet.icon}
                </div>
                <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-200">
                  {applet.title}
                </span>
              </Link>
            ) : (
              <div
                key={applet.title}
                className="flex flex-col items-center gap-3 text-center cursor-default"
              >
                <div
                  className={`w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-2xl bg-gradient-to-br ${applet.gradient} text-white flex items-center justify-center opacity-30 dark:opacity-20 saturate-50`}
                >
                  {applet.icon}
                </div>
                <span className="text-[13px] font-medium text-gray-400 dark:text-gray-600">
                  {applet.title}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
