import type { PaginatedMeta } from "../types/api-response.types";

interface PaginationProps {
  meta: PaginatedMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { page, limit, total } = meta;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Phân trang"
      className="flex items-center justify-center gap-1.5 font-manrope"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-bold text-neutral-600 disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:bg-neutral-50"
      >
        Trước
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          aria-current={p === page ? "page" : undefined}
          className={[
            "min-w-[34px] rounded-lg px-2.5 py-1.5 text-sm font-bold",
            p === page
              ? "bg-hub-500 text-white"
              : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50",
          ].join(" ")}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-bold text-neutral-600 disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:bg-neutral-50"
      >
        Sau
      </button>
    </nav>
  );
}
