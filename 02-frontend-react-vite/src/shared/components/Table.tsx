import type { ReactNode } from "react";

export interface TableColumn<T> {
  header: string;
  accessor: keyof T | string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  emptyState?: ReactNode;
}

export function Table<T>({ columns, rows, rowKey, onRowClick, emptyState }: TableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="flex min-h-[160px] items-center justify-center rounded-2xl border border-neutral-200 bg-white">
        {emptyState ?? (
          <p className="text-sm font-manrope text-neutral-500">Không có dữ liệu</p>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
      <table className="w-full min-w-[600px] border-collapse text-left">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50">
            {columns.map((col) => (
              <th
                key={String(col.accessor)}
                className="px-4 py-3 text-xs font-bold font-manrope uppercase tracking-wide text-neutral-500"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={[
                "border-b border-neutral-100 last:border-b-0",
                onRowClick ? "cursor-pointer hover:bg-neutral-50" : "",
              ].join(" ")}
            >
              {columns.map((col) => (
                <td
                  key={String(col.accessor)}
                  className={["px-4 py-3.5 text-sm font-manrope text-neutral-900", col.className ?? ""].join(" ")}
                >
                  {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.accessor as string] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
