import { useState } from "react";
import { Search } from "lucide-react";
import { Table, type TableColumn } from "../../../shared/components/Table";
import { Pagination } from "../../../shared/components/Pagination";
import { Tabs, type TabItem } from "../../../shared/components/Tabs";
import { Badge, type BadgeVariant } from "../../../shared/components/Badge";
import { Modal } from "../../../shared/components/Modal";
import { Button } from "../../../shared/components/Button";
import { formatDate } from "../../../shared/utils/format";
import { useAdminUsers } from "../hooks/useAdminUsers";
import { useUpdateUserStatus } from "../hooks/useUpdateUserStatus";
import type { AdminUser, UserRole } from "../types/admin-users.types";

const ROLE_TABS: TabItem[] = [
  { value: "all", label: "Tất cả" },
  { value: "buyer", label: "Người mua" },
  { value: "seller", label: "Người bán" },
  { value: "admin", label: "Quản trị viên" },
];

const ROLE_LABEL: Record<UserRole, { label: string; variant: BadgeVariant }> = {
  buyer: { label: "Người mua", variant: "info" },
  seller: { label: "Người bán", variant: "warning" },
  admin: { label: "Quản trị viên", variant: "error" },
};

const LIMIT = 10;

export function AdminUsersPage() {
  const [role, setRole] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lockTarget, setLockTarget] = useState<AdminUser | null>(null);

  const { data, isLoading, isError } = useAdminUsers({
    page,
    limit: LIMIT,
    role: role === "all" ? undefined : (role as UserRole),
    search: search || undefined,
  });
  const updateStatus = useUpdateUserStatus();

  const handleTabChange = (value: string) => {
    setRole(value);
    setPage(1);
  };

  const handleConfirmLock = () => {
    if (!lockTarget) return;
    updateStatus.mutate(
      { id: lockTarget.id, isActive: !lockTarget.isActive },
      { onSettled: () => setLockTarget(null) },
    );
  };

  const columns: TableColumn<AdminUser>[] = [
    {
      header: "Người dùng",
      accessor: "fullName",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-hub-50 text-[13px] font-bold text-hub-600">
            {row.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-xs font-bold text-neutral-900">{row.fullName}</div>
            <div className="text-[11px] text-neutral-400">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Vai trò",
      accessor: "role",
      render: (row) => {
        const meta = ROLE_LABEL[row.role];
        return <Badge variant={meta.variant}>{meta.label}</Badge>;
      },
    },
    {
      header: "Ngày tham gia",
      accessor: "createdAt",
      render: (row) => formatDate(row.createdAt),
    },
    {
      header: "Trạng thái",
      accessor: "isActive",
      render: (row) => (
        <Badge variant={row.isActive ? "success" : "error"}>
          {row.isActive ? "Hoạt động" : "Bị khóa"}
        </Badge>
      ),
    },
    {
      header: "Thao tác",
      accessor: "id",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setLockTarget(row)}
            className={row.isActive ? "text-xs font-bold text-error" : "text-xs font-bold text-success"}
          >
            {row.isActive ? "Khóa" : "Mở khóa"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Tabs tabs={ROLE_TABS} value={role} onChange={handleTabChange} />
        <div className="flex w-[280px] items-center gap-2 rounded-[9px] border border-neutral-200 bg-white px-3.5 py-2.5">
          <Search size={15} className="text-neutral-400" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên hoặc email..."
            className="w-full text-[13px] font-manrope text-neutral-900 outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>

      {isError && (
        <p className="text-sm font-manrope text-error">
          Không thể tải danh sách người dùng. Vui lòng thử lại.
        </p>
      )}

      {isLoading ? (
        <p className="text-sm font-manrope text-neutral-500">Đang tải...</p>
      ) : (
        <>
          <Table columns={columns} rows={data?.items ?? []} rowKey={(row) => row.id} />
          {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}

      <Modal
        open={lockTarget !== null}
        onClose={() => setLockTarget(null)}
        title={lockTarget?.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
      >
        <p className="mb-5 text-sm font-manrope text-neutral-600">
          {lockTarget?.isActive
            ? `Bạn có chắc muốn khóa tài khoản "${lockTarget?.fullName}"? Người dùng sẽ không thể đăng nhập cho tới khi được mở khóa lại.`
            : `Mở khóa tài khoản "${lockTarget?.fullName}"?`}
        </p>
        <div className="flex justify-end gap-2.5">
          <Button variant="outline" className="w-auto" onClick={() => setLockTarget(null)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            className="w-auto"
            isLoading={updateStatus.isPending}
            onClick={handleConfirmLock}
          >
            Xác nhận
          </Button>
        </div>
      </Modal>
    </div>
  );
}
