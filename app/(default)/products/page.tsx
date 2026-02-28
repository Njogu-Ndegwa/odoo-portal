export const metadata = {
  title: 'Products',
}

export default function ProductsPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
          Products
        </h1>
      </div>
      <div className="border border-gray-200 dark:border-gray-700/60 rounded-lg bg-white dark:bg-gray-800 shadow-sm p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
          <svg className="w-8 h-8 fill-current text-gray-400 dark:text-gray-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-.9-2-2-2zm-5 12H9v-2h6v2zm5-8H4V4h16v2z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
          Coming Soon
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          The products module is currently under development.
        </p>
      </div>
    </div>
  )
}
