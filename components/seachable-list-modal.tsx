'use client'

import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { Fragment, ReactNode } from 'react'
import { useTranslations } from 'next-intl'

interface SearchableListModalProps<T> {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    title?: string
    items: T[]
    searchPlaceholder?: string
    searchValue?: string
    onSearch?: (value: string) => void
    renderItem: (item: T) => ReactNode
    onSelect: (item: T) => void
    actionLabel: string
    onAction: () => void
    variant?: 'default' | 'with-sections'
    sectionTitle?: string
    selectedItemId?: number | null
}

export function SearchableListModal<T extends { id: any }>({
    isOpen,
    setIsOpen,
    title,
    items,
    searchPlaceholder,
    searchValue = '',
    onSearch,
    renderItem,
    onSelect,
    actionLabel,
    onAction,
    variant = 'default',
    sectionTitle,
    selectedItemId
}: SearchableListModalProps<T>) {
    const t = useTranslations('searchableModal')
    const resolvedPlaceholder = searchPlaceholder ?? t('searchPlaceholder')
    const resolvedSectionTitle = sectionTitle ?? t('recentSearches')
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
                <TransitionChild
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition ease-out duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-30" />
                </TransitionChild>

                <TransitionChild
                    as={Fragment}
                    enter="transition ease-in-out duration-200"
                    enterFrom="opacity-0 translate-y-4"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in-out duration-200"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-4"
                >
                    <div className="fixed inset-0 z-50 overflow-hidden flex items-start top-20 mb-4 justify-center px-4 sm:px-6">
                        <DialogPanel className="bg-white dark:bg-gray-800 border border-transparent dark:border-gray-700/60 overflow-auto max-w-2xl w-full max-h-full rounded-lg shadow-lg">
                            {/* Search form */}
                            {variant === 'default' && (
                                <form className="border-b border-gray-200 dark:border-gray-700/60">
                                    <div className="relative">
                                        <input
                                            className="w-full dark:text-gray-300 bg-white dark:bg-gray-800 border-0 focus:ring-transparent placeholder-gray-400 dark:placeholder-gray-500 appearance-none py-3 pl-10 pr-4"
                                            type="search"
                                            placeholder={resolvedPlaceholder}
                                            value={searchValue}
                                            onChange={(e) => onSearch?.(e.target.value)}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center right-auto group">
                                            <svg className="shrink-0 fill-current text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 ml-4 mr-2" width="16" height="16" viewBox="0 0 16 16">
                                                <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zM15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z" />
                                            </svg>
                                        </div>
                                    </div>
                                </form>
                            )}

                            <div className="py-4 px-2">
                                {title && (
                                    <div className="mb-3">
                                        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase px-2 mb-2">
                                            {title}
                                        </div>
                                    </div>
                                )}

                                <div className="mb-3 last:mb-0">
                                    {variant === 'with-sections' && (
                                        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase px-2 mb-2">
                                            {resolvedSectionTitle}
                                        </div>
                                    )}

                                    <ul className="text-sm">
                                        {items.map((item) => (
                                            <li key={item.id} className="mb-2 last:mb-0">
                                                <button
                                                    className={`flex items-center p-2 w-full text-left ${selectedItemId === item.id
                                                        ? 'text-violet-500'
                                                        : 'text-gray-800 dark:text-gray-100'
                                                        } hover:bg-gray-100 dark:hover:bg-gray-700/20 rounded-lg`}
                                                    onClick={() => onSelect(item)}
                                                >
                                                    {renderItem(item)}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mb-3 mt-3 last:mb-0">
                                    <div className="flex flex-wrap justify-end space-x-2">
                                        <button
                                            className="btn-sm border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {t('cancel')}
                                        </button>
                                        <button
                                            className="btn-sm bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
                                            onClick={() => {
                                                onAction()
                                                setIsOpen(false)
                                            }}
                                        >
                                            {actionLabel}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </TransitionChild>
            </Dialog>
        </Transition>
    )
}