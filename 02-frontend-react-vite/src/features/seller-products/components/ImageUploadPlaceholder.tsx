import { ImagePlus } from "lucide-react";

/**
 * `POST /products/:id/images` is not implemented on the backend yet (no object
 * storage wired up — see API_SPEC.md §6 catalog note). Render the upload UI per
 * the design so the layout matches `Product Management.dc.html`, but keep it
 * disabled with an honest caption instead of pretending uploads work.
 */
export function ImageUploadPlaceholder() {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold font-manrope text-neutral-700">Hình ảnh sản phẩm</span>
      <label
        aria-disabled="true"
        title="Tính năng tải ảnh sắp ra mắt"
        className="flex cursor-not-allowed flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 text-center"
      >
        <ImagePlus size={22} className="text-neutral-400" />
        <span className="text-sm font-bold font-manrope text-neutral-500">
          Kéo thả hoặc chọn ảnh để tải lên
        </span>
        <span className="text-xs font-manrope text-neutral-400">Sắp ra mắt</span>
        <input type="file" multiple disabled className="hidden" />
      </label>
    </div>
  );
}
