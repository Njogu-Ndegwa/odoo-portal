"use client";
// ManufacturersTable.tsx
import { useState, useEffect } from "react";
import Table from "@/components/table/table";
import { FleetInterface, CustomerInterface } from "../../accounts/types";
// import { getFleets, reassignFleetToAgent, assignFleetToAgent, getCustomers } from '../services/inventoryService'

import Link from "next/link";
import DynamicDropdown from "@/components/dropdown-dynamic";
import { getDistributorAgents } from "@/app/(auth)/services/authService";

import { AgentInterface } from "@/app/(auth)/services/authService";
import { useSelectedItems } from "@/app/selected-items-context";
import DateSelect from "@/components/date-select";
import FilterButton from "@/components/dropdown-filter";
import { SelectedItemsProvider } from "@/app/selected-items-context";
import Alert from "@/components/alert";
import { useAlert } from "@/app/contexts/alertContext";
import FeedbackModal from "@/components/feedback-modal";
import { useMessageTemplateColumns } from "./tableColumns";
import { actions } from "./tableActions";
import { SearchableListModal } from "@/components/seachable-list-modal";
import { useLazyGetAllPayPlanTemplatesQuery } from "./queries";
import { useAuth } from "@/lib/auth-context";
import { usePagination } from "@/components/utils/pagination";
// import { GetAllAssetAccountsForClient_getAllAssetAccountsForClient_page_edges } from './types/GetAllAssetAccountsForClient';
import { GetAllMessageTemplateResponse_page_edges } from "./types/GetAllMessageTemplateResponse";
import SearchForm from "@/components/search-form";
import PaginationClassic from "@/components/pagination-classic";
import { useTranslations } from "next-intl";
export default function FleetTableWrapper() {
  return (
    <SelectedItemsProvider>
      <FleetTable />
    </SelectedItemsProvider>
  );
}

function FleetTable() {
  const t = useTranslations("messageTemplate");
  const tc = useTranslations("common");
  const tm = useTranslations("modal");
  const { columns, dropdownOptions } = useMessageTemplateColumns();
  const [customers, setCustomers] = useState<
    GetAllMessageTemplateResponse_page_edges[]
  >([] as GetAllMessageTemplateResponse_page_edges[]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<AgentInterface[]>([]);
  const { setSelectedItems, selectedItems } = useSelectedItems();
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [isBannerOpen, setBannerOpen] = useState(false);
  const [dangerModalOpen, setDangerModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const { alert } = useAlert();
  const { distributorId } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const {
    currentCursor,
    cursorHistory,
    handleNext,
    handlePrevious,
    itemsPerPage,
    setItemsPerPage,
    hasPreviousPage, // Use this from hook instead of API
    currentPage, // Use this from hook instead of calculating
  } = usePagination();

  const [
    getAllAssetAccounts,
    { loading: assetLoading, error: assetError, data },
  ] = useLazyGetAllPayPlanTemplatesQuery();
  // const fetchCustomers = async () => {
  //   try {
  //     const data = await getCustomers()
  //     setCustomers(data)
  //   } catch (err) {
  //     setError('Failed to fetch customers')
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    getAllAssetAccounts();
  }, [debouncedSearchTerm, itemsPerPage]);

  const fetchAgents = async () => {
    try {
      const data = await getDistributorAgents();
      setAgents(data);
    } catch (err) {
    } finally {
    }
  };

  useEffect(() => {
    // fetchAgents()
    // fetchCustomers()
    getAllAssetAccounts();
  }, []);

  useEffect(() => {
    setCustomers(data?.getAllMessageTemplates?.page?.edges || []);
  }, [data]);

  const handleSelectionChange = (selectedIds: any[]) => {
    setSelectedItems(selectedIds);
  };

  const handleAgentSelect = (agent: any) => {
    setSelectedAgentId(agent.id); // Just set the ID, no actor here
  };

  const handleDropdownItemSelect = (option: any) => {
    setSelectedOption(option.id);
    if (option.id === 0) {
      setDangerModalOpen(true);
    } else if (option.id === 1 || option.id === 2) {
      setIsOpen(true);
    }
  };

  const loadData = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // fetchCustomers();
    setSelectedItems([]);
  };

  const handleActionClick = async (actor: string) => {
    // if (selectedAgentId) {
    //   if (actor === "assign") {
    //     assignFleetToAgent({ agent_id: selectedAgentId, fleet_ids: selectedItems })
    //     alert({ text: "Fleet Assignment started Successfully", type: "success" })
    //     loadData()
    //   } else if (actor === "reAssign") {
    //     await reassignFleetToAgent({ new_agent_id: selectedAgentId, fleet_ids: selectedItems })
    //     alert({ text: "Fleet ReAssignment started Successfully", type: "success" })
    //     loadData()
    //   }
    // } else {
    //   alert({ text: "Select an Agent First", type: "error" })
    // }
  };

  const filteredAgents = agents.filter((agent) =>
    agent.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  // 2. Add these pagination data extractors (add after your existing useEffect hooks):
  // Extract page info and count
  const pageInfo = data?.getAllMessageTemplates?.page?.pageInfo || {
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const totalCount = data?.getAllMessageTemplates?.pageData?.count || 0;

  // Handler for next page button
  const handleNextPage = () => {
    if (pageInfo.hasNextPage && pageInfo.endCursor) {
      handleNext(pageInfo.endCursor);
    }
  };

  // Handler for previous page button
  const handlePreviousPage = () => {
    handlePrevious();
  };

  // 4. Add useEffect to trigger query when current cursor changes:
  useEffect(() => {
    getAllAssetAccounts();
  }, [currentCursor]);
  console.log(columns, "Columns");
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      <FeedbackModal
        isOpen={dangerModalOpen}
        setIsOpen={setDangerModalOpen}
        variant="danger"
        title={tm("deleteTitle", { count: 1, entity: "template" })}
        content={tm("deleteConfirmation", { entity: "template" })}
        confirmButtonLabel={tm("yesDelete")}
      />
      <SearchableListModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title={tc("selectAnAgent")}
        items={filteredAgents}
        searchPlaceholder={tc("searchForAgent")}
        searchValue={searchQuery}
        onSearch={setSearchQuery}
        renderItem={(agent) => agent.email}
        onSelect={handleAgentSelect}
        selectedItemId={selectedAgentId}
        actionLabel={selectedOption === 1 ? tc("assignItem") : tc("reassignItem")}
        onAction={() =>
          handleActionClick(selectedOption === 1 ? "assign" : "reAssign")
        }
      />
      {/* Header section */}
      <div className="sm:flex sm:justify-between sm:items-center mb-5">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
            {t("title")}
          </h1>
        </div>

        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          <SearchForm
            placeholder={tc("search")}
            searchTerm={searchTerm}
            setSearchTerm={handleSearch}
          />
          <Link
            href="" // Replace with your desired path
            className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white flex items-center justify-center"
          >
            <svg
              className="fill-current shrink-0 xs:hidden"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
            </svg>
            <span className="max-xs:sr-only">{tc("add")}</span>
          </Link>
        </div>
      </div>
      <div className="sm:flex sm:justify-between sm:items-center mb-5">
        {/* Left side */}
        <div className="mb-4 sm:mb-0">
          <ul className="flex flex-wrap -m-1">
            <li className="m-1">
              <button className="inline-flex items-center justify-center text-sm font-medium leading-5 rounded-full px-3 py-1 border border-transparent shadow-sm bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-800 transition">
                {tc("all")}{" "}
                <span className="ml-1 text-gray-400 dark:text-gray-500">
                  {totalCount}
                </span>
              </button>
            </li>
          </ul>
        </div>

        {/* Right side */}
        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          {/* Delete button */}
          <DynamicDropdown
            options={dropdownOptions}
            onDropdownItemSelect={handleDropdownItemSelect}
          />
          {/* Dropdown */}
          <DateSelect />
          {/* Filter button */}
          <FilterButton align="right" />
        </div>
      </div>
      {/* Table section */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl">
        <Table
          data={customers}
          columns={columns}
          totalCount={customers.length}
          selectable
          actions={(row) => actions({ row, onDelete: loadData })}
          onSelectionChange={handleSelectionChange}
          isLoading={assetLoading}
        />
      </div>
      <div className="mt-8">
        <PaginationClassic
          currentPage={currentPage}
          totalItems={totalCount}
          itemsPerPage={itemsPerPage}
          hasNextPage={pageInfo.hasNextPage}
          hasPreviousPage={hasPreviousPage} // Use the one from hook
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
        />
      </div>
    </div>
  );
}
