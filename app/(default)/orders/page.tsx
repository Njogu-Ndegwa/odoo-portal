export const metadata = {
  title: 'Orders',
}

export default function OrdersPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
          Orders
        </h1>
      </div>
      <div className="border border-gray-200 dark:border-gray-700/60 rounded-lg bg-white dark:bg-gray-800 shadow-sm p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
          <svg className="w-8 h-8 fill-current text-gray-400 dark:text-gray-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
          Coming Soon
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          The orders module is currently under development.
        </p>
      </div>
    </div>
  )
}
