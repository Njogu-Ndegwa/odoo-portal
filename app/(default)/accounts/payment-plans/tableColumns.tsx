import { TableColumn } from "@/components/table/table";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

export function usePaymentPlanColumns() {
  const t = useTranslations("paymentPlans.columns");
  const td = useTranslations("common");

  const columns: TableColumn<any>[] = [
    {
      header: t("planName"),
      accessor: "node.planName" as keyof any,
      cellRenderer: (value: unknown, item: any) => {
        if (!item.node) return <div>-</div>;

        return (
          <div className="font-medium text-gray-800 dark:text-gray-100">
            {item.node.planName || "-"}
          </div>
        );
      },
    },
    {
      header: t("planDescription"),
      accessor: "node.planDescription" as keyof any,
      cellRenderer: (value: unknown, item: any) => {
        if (!item.node) return <div>-</div>;

        return (
          <div className="max-w-md truncate">
            {item?.node?.planDescription || "-"}
          </div>
        );
      },
    },
    {
      header: t("upFrontPrice"),
      accessor: "item.node.useUpfront" as keyof any,
      cellRenderer: (value: unknown, item: any) => {
        if (!item.node) return <div>-</div>;

        return (
          <div className="max-w-md truncate">
            {item.node.planDetails?.[0]?.pValue || "-"}
          </div>
        );
      },
    },
    {
      header: t("freeCodePrice"),
      accessor: "node.contact.email" as keyof any,
      cellRenderer: (value: unknown, item: any) => {
        if (!item.node) return <div>-</div>;

        return (
          <div className="max-w-md truncate">
            {item.node.planDetails?.[1]?.pValue || "-"}
          </div>
        );
      },
    },
    {
      header: t("daysToCutOff"),
      accessor: "node.address.city" as keyof any,
      cellRenderer: (value: unknown, item: any) => {
        if (!item.node) return <div>-</div>;

        const address = item.node.address;
        return (
          <div className="max-w-md truncate">
            {item.node.planDetails?.[2]?.pValue || "-"}
          </div>
        );
      },
    },
    {
      header: t("minimumPayment"),
      accessor: "node.distributor.name" as keyof any,
      cellRenderer: (value: unknown, item: any) => {
        if (!item.node) return <div>-</div>;

        return (
          <div className="max-w-md truncate">
            {item.node.planDetails?.[3]?.pValue || "-"}
          </div>
        );
      },
    },
    {
      header: t("hourPrice"),
      accessor: "node.distributor.name" as keyof any,
      cellRenderer: (value: unknown, item: any) => {
        if (!item.node) return <div>-</div>;

        return (
          <div className="max-w-md truncate">
            {item.node.planDetails?.[5]?.pValue || "-"}
          </div>
        );
      },
    },
    {
      header: t("useUpfront"),
      accessor: "node.useUpfront" as keyof any,
      cellRenderer: (value: unknown, item: any) => {
        if (!item.node) return <div>-</div>;

        return (
          <div className="max-w-md truncate">{item.node.useUpfront || "-"}</div>
        );
      },
    },
  ];

  const dropdownOptions = [
    {
      id: 0,
      value: td("delete"),
    },
    {
      id: 1,
      value: td("assignToAgent"),
    },
  ];

  return { columns, dropdownOptions };
}
