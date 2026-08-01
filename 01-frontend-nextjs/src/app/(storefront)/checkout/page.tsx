"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useCart } from "@/features/cart";
import { useCheckout, type CheckoutResult } from "@/features/order";
import { AddressForm, useAddresses } from "@/features/user";
import { Button } from "@/shared/components/Button";
import { RequireAuth } from "@/shared/components/RequireAuth";
import { formatPrice } from "@/shared/utils/format-price";

const STEPS = ["Địa chỉ", "Vận chuyển", "Thanh toán", "Hoàn tất"];

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const cartItemIds = useMemo(
    () =>
      (searchParams.get("items") ?? "")
        .split(",")
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0),
    [searchParams],
  );
  const voucherCode = searchParams.get("voucherCode") ?? undefined;

  const { data: cart } = useCart();
  const { data: addresses } = useAddresses();
  const checkoutMutation = useCheckout();

  const [step, setStep] = useState(0);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [result, setResult] = useState<CheckoutResult | null>(null);

  const selectedItems = useMemo(
    () => (cart?.items ?? []).filter((item) => cartItemIds.includes(item.id)),
    [cart, cartItemIds],
  );
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + Number(item.variant.price) * item.quantity,
    0,
  );

  if (cartItemIds.length === 0) {
    return (
      <div className="mx-auto max-w-[600px] px-4 py-16 text-center">
        <p className="font-manrope text-neutral-500">
          Không có sản phẩm nào được chọn để thanh toán.
        </p>
        <Link href="/cart" className="mt-2 inline-block text-sm font-bold text-hub-600">
          Quay lại giỏ hàng
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = () => {
    if (!selectedAddressId) return;
    checkoutMutation.mutate(
      {
        addressId: selectedAddressId,
        paymentMethod,
        voucherCode,
        cartItemIds,
      },
      {
        onSuccess: (data) => {
          setResult(data);
          setStep(3);
        },
      },
    );
  };

  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-6 px-4 py-6 md:px-6">
      <h1 className="text-xl font-bold font-sora text-neutral-900">Thanh toán</h1>

      <ol className="flex items-center gap-2 text-xs font-manrope text-neutral-500">
        {STEPS.map((label, index) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={[
                "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
                index <= step ? "bg-hub-500 text-white" : "bg-neutral-100 text-neutral-400",
              ].join(" ")}
            >
              {index + 1}
            </span>
            <span className={index === step ? "text-neutral-900" : ""}>{label}</span>
            {index < STEPS.length - 1 && <span className="mx-1 text-neutral-300">—</span>}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="flex flex-col gap-3">
          {(addresses ?? []).map((address) => (
            <label
              key={address.id}
              className={[
                "flex cursor-pointer flex-col gap-1 rounded-2xl border p-4 text-sm font-manrope",
                selectedAddressId === address.id
                  ? "border-hub-500 bg-hub-50"
                  : "border-neutral-200",
              ].join(" ")}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="addressId"
                  checked={selectedAddressId === address.id}
                  onChange={() => setSelectedAddressId(address.id)}
                  className="h-4 w-4 text-hub-500"
                />
                <span className="font-bold text-neutral-900">{address.recipientName}</span>
                <span className="text-neutral-500">{address.phone}</span>
              </div>
              <p className="pl-6 text-neutral-600">
                {[address.detailAddress, address.ward, address.district, address.province].join(
                  ", ",
                )}
              </p>
            </label>
          ))}

          {showAddressForm ? (
            <AddressForm
              onCreated={(addressId) => {
                setSelectedAddressId(addressId);
                setShowAddressForm(false);
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowAddressForm(true)}
              className="w-fit text-sm font-bold text-hub-600"
            >
              + Thêm địa chỉ mới
            </button>
          )}

          <Button
            type="button"
            disabled={!selectedAddressId}
            onClick={() => setStep(1)}
          >
            Tiếp tục
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-hub-500 bg-hub-50 p-4 text-sm font-manrope">
            <input type="radio" checked readOnly className="h-4 w-4 text-hub-500" />
            <div>
              <p className="font-bold text-neutral-900">Giao hàng tiêu chuẩn</p>
              <p className="text-neutral-500">Dự kiến giao trong 3-5 ngày</p>
            </div>
          </label>
          <div className="flex gap-3">
            <div className="w-32">
              <Button type="button" variant="outline" onClick={() => setStep(0)}>
                Quay lại
              </Button>
            </div>
            <Button type="button" onClick={() => setStep(2)}>
              Tiếp tục
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-3">
          {[
            { value: "cod", label: "Thanh toán khi nhận hàng (COD)" },
            { value: "bank_transfer", label: "Chuyển khoản ngân hàng" },
          ].map((option) => (
            <label
              key={option.value}
              className={[
                "flex cursor-pointer items-center gap-2 rounded-2xl border p-4 text-sm font-manrope",
                paymentMethod === option.value
                  ? "border-hub-500 bg-hub-50"
                  : "border-neutral-200",
              ].join(" ")}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === option.value}
                onChange={() => setPaymentMethod(option.value)}
                className="h-4 w-4 text-hub-500"
              />
              {option.label}
            </label>
          ))}

          {checkoutMutation.isError && (
            <p className="text-xs font-manrope text-error">
              Đặt hàng thất bại, vui lòng kiểm tra lại giỏ hàng hoặc mã giảm giá.
            </p>
          )}

          <div className="flex gap-3">
            <div className="w-32">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Quay lại
              </Button>
            </div>
            <Button
              type="button"
              isLoading={checkoutMutation.isPending}
              onClick={handleSubmitOrder}
            >
              Đặt hàng
            </Button>
          </div>
        </div>
      )}

      {step === 3 && result && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="text-4xl">🎉</span>
          <h2 className="text-lg font-bold font-sora text-neutral-900">Đặt hàng thành công!</h2>
          <p className="font-manrope text-neutral-500">
            {result.orders.length === 1
              ? `Mã đơn hàng: ${result.orders[0].orderCode}`
              : `${result.orders.length} đơn hàng đã được tạo`}
          </p>
          <p className="text-lg font-bold font-sora text-hub-600">
            {formatPrice(result.grandTotal)}
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              href="/orders"
              className="rounded-lg bg-hub-500 px-5 py-2.5 text-sm font-bold text-white"
            >
              Xem đơn hàng
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-hub-500 px-5 py-2.5 text-sm font-bold text-hub-600"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      )}

      {step < 3 && (
        <aside className="rounded-2xl border border-neutral-100 p-4">
          <h2 className="mb-2 text-sm font-bold font-sora text-neutral-900">Đơn hàng</h2>
          {selectedItems.map((item) => (
            <div key={item.id} className="flex justify-between py-1 text-xs font-manrope text-neutral-600">
              <span>
                {item.variant.product.name} x{item.quantity}
              </span>
              <span>{formatPrice(Number(item.variant.price) * item.quantity)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-neutral-100 pt-2 text-sm font-bold font-sora text-hub-600">
            <span>Tổng cộng</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </aside>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutPageContent />
    </RequireAuth>
  );
}
