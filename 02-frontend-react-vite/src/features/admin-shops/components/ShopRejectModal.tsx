import { useState } from "react";
import { Modal } from "../../../shared/components/Modal";
import { Button } from "../../../shared/components/Button";

interface ShopRejectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isSubmitting: boolean;
}

export function ShopRejectModal({ open, onClose, onSubmit, isSubmitting }: ShopRejectModalProps) {
  const [reason, setReason] = useState("");

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Từ chối gian hàng">
      <label
        htmlFor="rejection-reason"
        className="mb-1.5 block text-xs font-bold font-manrope text-neutral-700"
      >
        Lý do từ chối
      </label>
      <textarea
        id="rejection-reason"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Nhập lý do từ chối để gửi cho người bán..."
        rows={4}
        className="mb-5 w-full rounded-lg border border-neutral-200 px-3.5 py-3 text-sm font-manrope text-neutral-900 outline-none focus:border-hub-500 focus:ring-3 focus:ring-hub-100"
      />
      <div className="flex justify-end gap-2.5">
        <Button variant="outline" className="w-auto" onClick={handleClose}>
          Hủy
        </Button>
        <Button
          variant="primary"
          className="w-auto bg-error hover:bg-error"
          disabled={reason.trim().length < 3}
          isLoading={isSubmitting}
          onClick={() => onSubmit(reason.trim())}
        >
          Xác nhận từ chối
        </Button>
      </div>
    </Modal>
  );
}
