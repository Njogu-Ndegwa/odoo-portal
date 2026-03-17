import { useTranslations } from 'next-intl'

interface PaginationClassicProps {
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
}

export default function PaginationClassic({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  hasNextPage = false,
  hasPreviousPage = false,
  onNextPage,
  onPreviousPage
}: PaginationClassicProps) {
  // Calculate display values
  const t = useTranslations('pagination')
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(startItem + itemsPerPage - 1, totalItems);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="text-sm text-gray-500 text-center sm:text-left">
        {totalItems > 0 ? (
          <>
            {t('showing')} <span className="font-medium text-gray-600 dark:text-gray-300">{startItem}</span> {t('to')} <span className="font-medium text-gray-600 dark:text-gray-300">{endItem}</span> {t('of')} <span className="font-medium text-gray-600 dark:text-gray-300">{totalItems}</span> {t('results')}
          </>
        ) : (
          <span>{t('noResults')}</span>
        )}
      </div>
      <nav role="navigation" aria-label="Navigation">
        <ul className="flex justify-center">
          <li className="ml-3 first:ml-0">
            <button 
              className={`btn border ${hasPreviousPage 
                ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300' 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 text-gray-300 dark:text-gray-600'}`}
              onClick={onPreviousPage}
              disabled={!hasPreviousPage}
            >
              {t('previous')}
            </button>
          </li>
          <li className="ml-3 first:ml-0">
            <button 
              className={`btn border ${hasNextPage 
                ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300' 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 text-gray-300 dark:text-gray-600'}`}
              onClick={onNextPage}
              disabled={!hasNextPage}
            >
              {t('next')}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
