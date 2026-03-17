"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Transition,
} from "@headlessui/react";

const locales = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "zh", label: "ZH", flag: "🇨🇳" },
  { code: "fr", label: "FR", flag: "🇫🇷" },
] as const;

function getCurrentLocale(): string {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/NEXT_LOCALE=(\w+)/);
  return match?.[1] ?? "en";
}

export default function LanguageSwitcher({
  align,
}: {
  align?: "left" | "right";
}) {
  const t = useTranslations("languageSwitcher");
  const router = useRouter();
  const current = getCurrentLocale();
  const currentLocale = locales.find((l) => l.code === current) ?? locales[0];

  function switchLocale(code: string) {
    document.cookie = `NEXT_LOCALE=${code};path=/;max-age=31536000`;
    router.refresh();
  }

  return (
    <Menu as="div" className="relative inline-flex">
      <MenuButton className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 lg:hover:bg-gray-200 dark:hover:bg-gray-700/50 dark:lg:hover:bg-gray-800 rounded-full">
        <span className="sr-only">{t("language")}</span>
        <svg
          className="fill-current text-gray-500/80 dark:text-gray-400/80"
          width={16}
          height={16}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A8.03 8.03 0 0 1 5.08 16zm2.95-8H5.08a8.03 8.03 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z" />
        </svg>
      </MenuButton>
      <Transition
        as="div"
        className={`origin-top-right z-10 absolute top-full min-w-[9rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1 ${
          align === "right" ? "right-0" : "left-0"
        }`}
        enter="transition ease-out duration-200 transform"
        enterFrom="opacity-0 -translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <MenuItems as="ul" className="focus:outline-hidden">
          {locales.map((locale) => (
            <MenuItem as="li" key={locale.code}>
              <button
                className={`font-medium text-sm flex items-center w-full py-1 px-3 ${
                  locale.code === current
                    ? "text-violet-500"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                }`}
                onClick={() => switchLocale(locale.code)}
              >
                <span className="mr-2">{locale.flag}</span>
                <span>{t(locale.code)}</span>
                {locale.code === current && (
                  <svg
                    className="ml-auto shrink-0 fill-current text-violet-500"
                    width={12}
                    height={12}
                    viewBox="0 0 12 12"
                  >
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                )}
              </button>
            </MenuItem>
          ))}
        </MenuItems>
      </Transition>
    </Menu>
  );
}
