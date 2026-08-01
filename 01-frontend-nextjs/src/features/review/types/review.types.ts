export interface Review {
  id: number;
  productId: number;
  orderItemId: number;
  userId: number;
  rating: number;
  comment: string | null;
  sellerReply: string | null;
  createdAt: string;
}
