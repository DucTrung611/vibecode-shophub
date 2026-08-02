import { useRef } from "react";
import { ImagePlus } from "lucide-react";
import { getAssetUrl } from "../../../shared/utils/asset-url";
import { useUploadProductImages } from "../hooks/useProductMutations";
import type { ProductImage } from "../types/product.types";

interface ProductImageUploadProps {
  productId: number;
  slug: string;
  images: ProductImage[];
}

export function ProductImageUpload({ productId, slug, images }: ProductImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadImages = useUploadProductImages(productId, slug);

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    uploadImages.mutate(Array.from(fileList));
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold font-manrope text-neutral-700">Hình ảnh sản phẩm</span>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((image) => (
            <img
              key={image.id}
              src={getAssetUrl(image.url)}
              alt=""
              className="aspect-square w-full rounded-xl border border-neutral-200 object-cover"
            />
          ))}
        </div>
      )}

      <label
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 text-center hover:border-hub-400"
        aria-disabled={uploadImages.isPending}
      >
        <ImagePlus size={22} className="text-neutral-400" />
        <span className="text-sm font-bold font-manrope text-neutral-500">
          {uploadImages.isPending ? "Đang tải ảnh lên..." : "Kéo thả hoặc chọn ảnh để tải lên"}
        </span>
        <span className="text-xs font-manrope text-neutral-400">JPEG, PNG, WEBP — tối đa 5MB/ảnh</span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          disabled={uploadImages.isPending}
          className="hidden"
          onChange={(event) => handleFilesSelected(event.target.files)}
        />
      </label>
    </div>
  );
}

export function ProductImageUploadDisabledHint() {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold font-manrope text-neutral-700">Hình ảnh sản phẩm</span>
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 text-center">
        <ImagePlus size={22} className="text-neutral-400" />
        <span className="text-sm font-manrope text-neutral-500">
          Lưu sản phẩm trước để bắt đầu tải ảnh lên
        </span>
      </div>
    </div>
  );
}
