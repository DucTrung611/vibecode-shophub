"use client";

import { useState } from "react";
import { useLogout } from "@/features/auth";
import { useOrders } from "@/features/order";
import { AddressForm, ProfileForm, useAddresses, useProfile } from "@/features/user";
import { useVouchers } from "@/features/voucher";
import { useWishlist } from "@/features/wishlist";
import { RequireAuth } from "@/shared/components/RequireAuth";

function ProfilePageContent() {
  const { data: profile, isLoading } = useProfile();
  const { data: orders } = useOrders();
  const { data: wishlist } = useWishlist();
  const { data: vouchers } = useVouchers();
  const { data: addresses } = useAddresses();
  const logout = useLogout();

  const [showAddressForm, setShowAddressForm] = useState(false);

  if (isLoading || !profile) {
    return (
      <div className="px-4 py-16 text-center text-sm font-manrope text-neutral-500">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[700px] flex-col gap-6 px-4 py-6 md:px-6">
      <div className="flex items-center gap-4 rounded-2xl border border-neutral-100 p-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-hub-500 text-2xl font-bold text-white font-sora">
          {profile.fullName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-bold font-sora text-neutral-900">{profile.fullName}</p>
          <p className="text-sm text-neutral-500 font-manrope">{profile.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-neutral-100 p-3 text-center">
          <p className="text-lg font-bold font-sora text-hub-600">{orders?.length ?? 0}</p>
          <p className="text-xs text-neutral-500 font-manrope">Đơn hàng</p>
        </div>
        <div className="rounded-2xl border border-neutral-100 p-3 text-center">
          <p className="text-lg font-bold font-sora text-hub-600">{wishlist?.length ?? 0}</p>
          <p className="text-xs text-neutral-500 font-manrope">Yêu thích</p>
        </div>
        <div className="rounded-2xl border border-neutral-100 p-3 text-center">
          <p className="text-lg font-bold font-sora text-hub-600">{vouchers?.length ?? 0}</p>
          <p className="text-xs text-neutral-500 font-manrope">Voucher</p>
        </div>
      </div>

      <section className="rounded-2xl border border-neutral-100 p-4">
        <h2 className="mb-3 text-sm font-bold font-sora text-neutral-900">Thông tin cá nhân</h2>
        <ProfileForm profile={profile} />
      </section>

      <section className="rounded-2xl border border-neutral-100 p-4">
        <h2 className="mb-3 text-sm font-bold font-sora text-neutral-900">Địa chỉ của tôi</h2>
        <div className="flex flex-col gap-2">
          {(addresses ?? []).map((address) => (
            <div key={address.id} className="rounded-xl bg-neutral-50 p-3 text-sm font-manrope">
              <p className="font-bold text-neutral-900">
                {address.recipientName} · {address.phone}
              </p>
              <p className="text-neutral-500">
                {[address.detailAddress, address.ward, address.district, address.province].join(
                  ", ",
                )}
              </p>
            </div>
          ))}
        </div>

        {showAddressForm ? (
          <div className="mt-3">
            <AddressForm onCreated={() => setShowAddressForm(false)} />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddressForm(true)}
            className="mt-3 text-sm font-bold text-hub-600"
          >
            + Thêm địa chỉ mới
          </button>
        )}
      </section>

      <button
        type="button"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className="rounded-xl border border-error px-4 py-3 text-sm font-bold font-manrope text-error"
      >
        Đăng xuất
      </button>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfilePageContent />
    </RequireAuth>
  );
}
