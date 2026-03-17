import { TableColumn } from "@/components/table/table";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

export function useFleetColumns() {
  const t = useTranslations("thingFleet.columns");
  const tc = useTranslations("common");

  const columns: TableColumn<any>[] = [
    {
      header: t("fleetName"),
      accessor: "node.fleetName" as keyof any,
      cellRenderer: (value: unknown, item: any) => (
        <div className="font-medium text-gray-800 dark:text-gray-100">
          {String(item.node.fleetName)}
        </div>
      ),
    },
    {
      header: t("description"),
      accessor: "node.credit.owner.name" as keyof any,
      cellRenderer: (value: unknown, item: any) => (
        <div className="max-w-md truncate">
          {item.node.description || "-"}
        </div>
      ),
    },
    {
      header: t("freeCodeCount"),
      accessor: "node.credit.owner.contact.phone" as keyof any,
      cellRenderer: (value: unknown, item: any) => (
        <div className="max-w-md truncate">{item.node.freeCodeCount || "-"}</div>
      ),
    },
    {
      header: t("actionScope"),
      accessor: "node.credit.owner.address.city" as keyof any,
      cellRenderer: (value: unknown, item: any) => {
        return (
          <div className="max-w-md truncate">{item.node.actionScope || "-"}</div>
        );
      },
    },
    {
      header: t("codeInterval"),
      accessor: "node.credit.balance" as keyof any,
      cellRenderer: (value: unknown, item: any) => {
        return (
          <div className="max-w-md truncate">
            {item.node.codeGenInterval || "-"}
          </div>
        );
      },
    },
    {
      header: t("profile"),
      accessor: "node.credit.accountStatus" as keyof any,
      cellRenderer: (value: unknown, item: any) => {
        return (
          <div className="max-w-md truncate">{item.node.profile || "-"}</div>
        );
      },
    },
    {
      header: t("createdAt"),
      accessor: "node.createdAt" as keyof any,
      cellRenderer: (value: unknown, item: any) => {
        try {
          const formattedDate = format(
            new Date(item.node.createdAt),
            "MMM dd, yyyy"
          );
          return <div className="max-w-md truncate">{formattedDate}</div>;
        } catch (e) {
          return <div className="max-w-md truncate">-</div>;
        }
      },
    },
    {
      header: t("updatedAt"),
      accessor: "node.updatedAt" as keyof any,
      cellRenderer: (value: unknown, item: any) => {
        try {
          const formattedDate = format(
            new Date(item.node.updatedAt),
            "MMM dd, yyyy"
          );
          return <div className="max-w-md truncate">{formattedDate}</div>;
        } catch (e) {
          return <div className="max-w-md truncate">-</div>;
        }
      },
    },
  ];

  const dropdownOptions = [
    {
      id: 0,
      value: tc("delete"),
    },
    {
      id: 1,
      value: tc("assignToAgent"),
    },
  ];

  return { columns, dropdownOptions };
}
