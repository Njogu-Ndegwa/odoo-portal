'use client'
import React from "react";
import { useTranslations } from "next-intl";

interface SearchFormProps {
  placeholder?: string;
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
}

 const SearchForm: React.FC<SearchFormProps> = ({
  placeholder,
  searchTerm,
  setSearchTerm,
}) => {
  const t = useTranslations('common')
  return (
    <form className="relative">
      <label htmlFor="action-search" className="sr-only">
        {t('search')}
      </label>
      <input
        id="action-search"
        className="form-input pl-9 bg-white dark:bg-gray-800"
        type="search"
        placeholder={placeholder}
        value={searchTerm}
        // @ts-ignore
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button
        className="absolute inset-0 right-auto group"
        type="submit"
        aria-label={t('search')}
      >
        <svg
          className="shrink-0 fill-current text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 ml-3 mr-2"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" />
          <path d="M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z" />
        </svg>
      </button>
    </form>
  );
};

export default SearchForm