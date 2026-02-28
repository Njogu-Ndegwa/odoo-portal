'use client'
// Update your type definitions in types.ts
export interface NodeWithId {
  _id: string;
  [key: string]: any;
}

export interface TableItemWithNode {
  node?: NodeWithId;
  id?: string | number;
  [key: string]: any;
}

export interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  cellRenderer?: (value: any, item: T) => React.ReactNode;
}

export interface TableProps<T extends TableItemWithNode> {
  data: T[];
  columns: TableColumn<T>[];
  title?: string;
  totalCount?: number;
  selectable?: boolean;
  actions?: (item: T) => React.ReactNode;
  onSelectionChange?: (selectedIds: any[]) => void;
  isLoading?: boolean; 
  emptyMessage?: string,
  emptyDescription?: string
}


// useTableSelection.ts
// Replace your current useTableSelection hook with this updated version
// This version handles both direct IDs and nested node IDs

import { useState, useCallback, useEffect } from 'react'
import { ReactNode } from 'react'
import TableSkeleton from './tableSkeleton';
export function useTableSelection<T extends { id?: any, node?: any }>(items: T[]) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Helper function to get ID from an item
  const getItemId = useCallback((item: T): string => {
    // For GraphQL nested structures with node
    if (item.node && item.node._id) {
      return item.node._id;
    }
    // For direct ID property
    if (item.id) {
      return item.id;
    }
    // Fallback to string representation if necessary
    return String(item);
  }, []);

  const isAllSelected = items.length > 0 && selectedItems.length === items.length

  const handleCheckboxChange = useCallback((id: string, checked: boolean) => {
    setSelectedItems(prev =>
      checked 
        ? [...prev, id] 
        : prev.filter(itemId => itemId !== id)
    )
  }, [])

  const handleSelectAllChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedItems(e.target.checked 
      ? items.map(item => getItemId(item)) 
      : []
    )
  }, [items, getItemId])

  return {
    selectedItems,
    isAllSelected,
    handleCheckboxChange,
    handleSelectAllChange,
    getItemId, // Export this so TableRow can use it too
  }
}

interface TableRowProps<T extends TableItemWithNode> {
  item: T;
  columns: TableColumn<T>[];
  selectable?: boolean;
  isSelected?: boolean;
  onCheckboxChange?: (id: any, checked: boolean) => void;
  actions?: (item: T) => React.ReactNode;
}
function TableRow<T extends TableItemWithNode>({
  item,
  columns,
  selectable,
  isSelected,
  onCheckboxChange,
  actions
}: TableRowProps<T>) {

  const getActualId = () => {
    if (item.node && item.node._id) {
      return item.node._id;
    }
    if (item.id) {
      return item.id;
    }
    return String(item);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCheckboxChange?.(getActualId(), e.target.checked);
  };

  const getCellContent = (column: TableColumn<T>): ReactNode => {
    try {
      // Handle null node - Important fix
      if (item.node === null) {
        return '-';
      }

      // Get value based on accessor type
      const value = typeof column.accessor === 'function'
        ? column.accessor(item)
        : item[column.accessor as keyof T] // Use type assertion for safer access

      // Use cell renderer if provided
      if (column.cellRenderer) {
        return column.cellRenderer(value, item);
      }

      // Handle null/undefined values
      if (value === null || value === undefined) {
        return '-';
      }

      // Handle objects
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }

      // Return string value with fallback
      return String(value || '-');
    } catch (error) {
      console.error('Error rendering cell:', error);
      return '-'; // Fallback value if any error occurs
    }
  }
  return (
    <tr>
      {selectable && (
        <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px">
          <div className="flex items-center">
            <label className="inline-flex">
              <span className="sr-only">Select</span>
              <input
                type="checkbox"
                className="form-checkbox"
                checked={isSelected}
                onChange={handleChange}
              />
            </label>
          </div>
        </td>
      )}

      {columns.map((column, index) => (
        <td
          key={index}
          className={`px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap ${column.className || ''}`}
        >
          {getCellContent(column)}
        </td>
      ))}


      {actions && (
        <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px sticky right-0 bg-white dark:bg-gray-800 z-10 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="space-x-1">
            {actions(item)}
          </div>
        </td>
      )}
    </tr>
  )
}

// Table.tsx
// Update your Table component to handle empty state differently
// No need for a separate EmptyState component anymore

export default function Table<T extends TableItemWithNode>({
  data,
  columns,
  title,
  totalCount,
  selectable = false,
  actions,
  onSelectionChange,
  isLoading = false,
  emptyMessage = "No data available",
  emptyDescription = "Try adjusting your search or filter to find what you're looking for."
}: TableProps<T>) {

  const validData = data.filter(item => {
    // Keep items that don't have a node property or have a valid node
    return !('node' in item) || item.node !== null;
  });

  const {
    selectedItems,
    isAllSelected,
    handleCheckboxChange,
    handleSelectAllChange,
    getItemId
  } = useTableSelection(validData)

  useEffect(() => {
    onSelectionChange?.(selectedItems)
  }, [selectedItems, onSelectionChange])

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl relative">
      {title && (
        <header className="px-5 py-4">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">
            {title} {totalCount !== undefined && (
              <span className="text-gray-400 dark:text-gray-500 font-medium">
                {totalCount}
              </span>
            )}
          </h2>
        </header>
      )}

      {isLoading ? (
        <TableSkeleton 
          columns={columns} 
          selectable={selectable} 
          hasActions={!!actions} 
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full dark:text-gray-300">
            <thead className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-t border-b border-gray-100 dark:border-gray-700/60">
              <tr>
                {selectable && (
                  <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px">
                    <div className="flex items-center">
                      <label className="inline-flex">
                        <span className="sr-only">Select all</span>
                        <input
                          type="checkbox"
                          className="form-checkbox"
                          checked={isAllSelected}
                          onChange={handleSelectAllChange}
                          disabled={data.length === 0}
                        />
                      </label>
                    </div>
                  </th>
                )}

                {columns.map((column, index) => (
                  <th key={index} className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                    <div className="font-semibold text-left">{column.header}</div>
                  </th>
                ))}

                {actions && (
                  <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap sticky right-0 bg-gray-50 dark:bg-gray-900/20 z-10 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)]">
                    <div className="font-semibold text-left">Actions</div>
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/60">
              {data.length > 0 ? (
                data.map((item) => (
                  <TableRow
                    key={getItemId(item)}
                    item={item}
                    columns={columns}
                    selectable={selectable}
                    isSelected={selectedItems.includes(getItemId(item))}
                    onCheckboxChange={handleCheckboxChange}
                    actions={actions}
                  />
                ))
              ) : (
                <tr>
                  <td 
                    colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                    className="px-2 py-8 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <svg 
                        className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        aria-hidden="true"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
                        />
                      </svg>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{emptyMessage}</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {emptyDescription}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}