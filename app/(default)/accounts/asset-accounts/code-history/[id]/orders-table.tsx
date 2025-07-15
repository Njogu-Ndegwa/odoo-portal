
'use client'
import Design2Table from '@/components/table/table2'
import { Design2TableColumn } from '@/components/table/table2'
import { format } from 'date-fns';

export default function TransactionsTable({ transactions }: { transactions: any }) {
  const handleTransactionClick = (transaction: any) => {
    console.log('-items')
  }

  // Update your columns definition to use proper typing
  const columns: Design2TableColumn<any>[] = [
    {
      header: 'Code Value',
      accessor: (item) => item.node.codeDecString,
      cellRenderer: (value) => (
        <div className="font-medium text-gray-800 dark:text-gray-100">
          {value}
        </div>
      )
    },

    {
      header: 'Code Type',
      accessor: (item) => item.node.codeType, 
      cellRenderer: (value) => (
        <span className="font-medium text-gray-800 dark:text-gray-100 truncate max-w-xs">{value}</span>
      )
    },

    {
      header: 'Code Count',
      accessor: (item) => item.node.codeCount,
      cellRenderer: (value) => (
        <div className="font-medium text-gray-800 dark:text-gray-100 truncate max-w-xs">
          {value}
        </div>
      )
    },
    {
      header: 'Created At',
      accessor: (item) => item.node.createdAt,
      align: 'right',
      cellRenderer: (value) => {
        const formattedDate = format(new Date(String(value)), 'MMM dd, yyyy HH:mm:ss');
        return <div className="font-medium text-gray-800 dark:text-gray-100">{formattedDate}</div>;
      }
    }
  ];

  console.log(transactions, "Transations")
  
  return (
    <div className="w-full">
      <div className="overflow-auto">
        <Design2Table
          data={transactions}
          columns={columns}
          selectable
        />
      </div>
    </div>
  )
}