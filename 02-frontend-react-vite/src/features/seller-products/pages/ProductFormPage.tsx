import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Card } from "../../../shared/components/Card";
import { ProductBasicInfoForm } from "../components/ProductBasicInfoForm";
import {
  ProductImageUpload,
  ProductImageUploadDisabledHint,
} from "../components/ProductImageUpload";
import { VariantsSection } from "../components/VariantsSection";
import { useProductDetail } from "../hooks/useProductDetail";
import { useCreateProduct, useUpdateProduct } from "../hooks/useProductMutations";
import type { ProductStatus } from "../types/product.types";

export function ProductFormPage() {
  const { slug } = useParams<{ slug: string }>();
  const isEdit = !!slug;
  const { data: product, isLoading } = useProductDetail(slug);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(product?.id ?? 0, slug ?? "");

  return (
    <div className="flex flex-col gap-5">
      <Link
        to="/seller/products"
        className="flex w-fit items-center gap-1.5 text-sm font-bold font-manrope text-hub-600 hover:underline"
      >
        <ArrowLeft size={15} />
        Quay lại danh sách sản phẩm
      </Link>

      <h1 className="font-sora text-lg font-extrabold text-neutral-900">
        {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
      </h1>

      {isEdit && isLoading && (
        <p className="text-sm font-manrope text-neutral-500">Đang tải sản phẩm...</p>
      )}

      {(!isEdit || product) && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <ProductBasicInfoForm
              defaultValues={
                product ? { name: product.name, categoryId: product.categoryId } : undefined
              }
              status={product?.status}
              onStatusChange={
                product
                  ? (status: ProductStatus) => updateProduct.mutate({ status })
                  : undefined
              }
              isSubmitting={createProduct.isPending || updateProduct.isPending}
              submitLabel={isEdit ? "Lưu thay đổi" : "Tạo sản phẩm"}
              onSubmit={(values) => {
                if (isEdit && product) {
                  updateProduct.mutate(values);
                } else {
                  createProduct.mutate(values);
                }
              }}
            />
          </Card>

          <Card>
            {product ? (
              <ProductImageUpload productId={product.id} slug={product.slug} images={product.images} />
            ) : (
              <ProductImageUploadDisabledHint />
            )}
          </Card>

          {isEdit && product && (
            <Card className="xl:col-span-3">
              <VariantsSection productId={product.id} slug={product.slug} variants={product.variants} />
            </Card>
          )}

          {!isEdit && (
            <Card className="xl:col-span-3">
              <p className="text-sm font-manrope text-neutral-500">
                Lưu sản phẩm để bắt đầu thêm phân loại (màu sắc, kích thước, giá, tồn kho).
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
