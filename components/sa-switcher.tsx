"use client";

import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Transition,
} from "@headlessui/react";
import { useSA } from "@/lib/sa-context";
import portalApolloClient from "@/lib/portal-apollo-client";

const roleBadge: Record<string, { label: string; cls: string }> = {
  admin: { label: "Admin", cls: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300" },
  staff: { label: "Staff", cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300" },
  agent: { label: "Agent", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" },
};

export default function SASwitcher() {
  const { currentSA, serviceAccounts, selectSA } = useSA();

  if (!currentSA) return null;

  const showDropdown = serviceAccounts.length > 1;

  if (!showDropdown) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-sm">
        <svg className="w-4 h-4 text-violet-500 shrink-0" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm0 14.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13ZM5.5 7a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm3 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm-4 3.25a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1-.75-.75Z" />
        </svg>
        <span className="font-medium text-gray-700 dark:text-gray-200 truncate max-w-[160px]">
          {currentSA.name}
        </span>
      </div>
    );
  }

  function handleSwitch(sa: typeof currentSA) {
    if (!sa || sa.id === currentSA?.id) return;
    selectSA(sa);
    portalApolloClient.clearStore();
  }

  return (
    <Menu as="div" className="relative inline-flex">
      <MenuButton className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm group">
        <svg className="w-4 h-4 text-violet-500 shrink-0" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm0 14.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13ZM5.5 7a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm3 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm-4 3.25a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1-.75-.75Z" />
        </svg>
        <span className="font-medium text-gray-700 dark:text-gray-200 truncate max-w-[160px]">
          {currentSA.name}
        </span>
        <svg className="w-3 h-3 shrink-0 fill-current text-gray-400 dark:text-gray-500" viewBox="0 0 12 12">
          <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
        </svg>
      </MenuButton>

      <Transition
        as="div"
        className="origin-top-left z-10 absolute top-full left-0 min-w-[14rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1"
        enter="transition ease-out duration-200 transform"
        enterFrom="opacity-0 -translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="pt-0.5 pb-2 px-3 mb-1 border-b border-gray-200 dark:border-gray-700/60">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Switch Account
          </div>
        </div>
        <MenuItems as="ul" className="focus:outline-hidden max-h-64 overflow-y-auto">
          {serviceAccounts.map((sa) => {
            const active = sa.id === currentSA.id;
            const badge = roleBadge[sa.my_role] ?? roleBadge.agent;
            return (
              <MenuItem key={sa.id} as="li">
                <button
                  className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-2 transition-colors
                    ${active
                      ? "bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"}`}
                  onClick={() => handleSwitch(sa)}
                >
                  <span className="truncate">{sa.name}</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${badge.cls}`}>
                    {badge.label}
                  </span>
                </button>
              </MenuItem>
            );
          })}
        </MenuItems>
      </Transition>
    </Menu>
  );
}
