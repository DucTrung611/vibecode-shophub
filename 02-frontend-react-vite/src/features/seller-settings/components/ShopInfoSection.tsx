import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { getAssetUrl } from "../../../shared/utils/asset-url";
import { useMyShop } from "../hooks/useMyShop";
import { useUpdateShop } from "../hooks/useUpdateShop";
import { useUploadShopBanner, useUploadShopLogo } from "../hooks/useUploadShopImage";
import { shopInfoSchema, type ShopInfoFormValues } from "../utils/shop.schema";

export function ShopInfoSection() {
  const { data: shop, isLoading } = useMyShop();
  const updateShop = useUpdateShop();
  const uploadLogo = useUploadShopLogo();
  const uploadBanner = useUploadShopBanner();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShopInfoFormValues>({
    resolver: zodResolver(shopInfoSchema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (shop) {
      reset({ name: shop.name, description: shop.description ?? "" });
    }
  }, [shop, reset]);

  if (isLoading) {
    return <p className="text-sm font-manrope text-neutral-500">Đang tải thông tin shop...</p>;
  }

  return (
    <form
      className="flex max-w-md flex-col gap-4"
      onSubmit={handleSubmit((values) => updateShop.mutate(values))}
    >
      <Input
        id="shop-name"
        label="Tên shop"
        {...register("name")}
        error={errors.name?.message}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="shop-description" className="text-xs font-bold font-manrope text-neutral-700">
          Mô tả shop
        </label>
        <textarea
          id="shop-description"
          rows={3}
          {...register("description")}
          className="rounded-[9px] border border-neutral-200 px-3.5 py-3 text-sm font-manrope text-neutral-900 outline-none focus:border-hub-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold font-manrope text-neutral-700">Đường dẫn shop</span>
        <div className="rounded-[9px] border border-neutral-200 bg-neutral-50 px-3.5 py-3 text-sm font-manrope text-neutral-500">
          /{shop?.slug}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold font-manrope text-neutral-700">Logo shop</span>
        <div className="flex items-center gap-3">
          {shop?.logoUrl && (
            <img
              src={getAssetUrl(shop.logoUrl)}
              alt="Logo shop"
              className="h-14 w-14 rounded-full border border-neutral-200 object-cover"
            />
          )}
          <button
            type="button"
            disabled={uploadLogo.isPending}
            onClick={() => logoInputRef.current?.click()}
            className="rounded-[9px] border border-dashed border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-xs font-bold font-manrope text-neutral-600 hover:border-hub-400 disabled:opacity-60"
          >
            {uploadLogo.isPending ? "Đang tải..." : "Tải logo lên"}
          </button>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) uploadLogo.mutate(file);
              event.target.value = "";
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold font-manrope text-neutral-700">Ảnh bìa shop</span>
        <div className="flex flex-col gap-2">
          {shop?.bannerUrl && (
            <img
              src={getAssetUrl(shop.bannerUrl)}
              alt="Ảnh bìa shop"
              className="h-24 w-full rounded-xl border border-neutral-200 object-cover"
            />
          )}
          <button
            type="button"
            disabled={uploadBanner.isPending}
            onClick={() => bannerInputRef.current?.click()}
            className="w-fit rounded-[9px] border border-dashed border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-xs font-bold font-manrope text-neutral-600 hover:border-hub-400 disabled:opacity-60"
          >
            {uploadBanner.isPending ? "Đang tải..." : "Tải ảnh bìa lên"}
          </button>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) uploadBanner.mutate(file);
              event.target.value = "";
            }}
          />
        </div>
      </div>

      <div>
        <Button type="submit" isLoading={updateShop.isPending}>
          Lưu thay đổi
        </Button>
      </div>
    </form>
  );
}
