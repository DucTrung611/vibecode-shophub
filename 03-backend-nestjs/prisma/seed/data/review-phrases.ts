/** Canned but varied review text per rating tier, in Vietnamese, matching how real
 * marketplace reviews actually read — short, colloquial, sometimes no comment at all. */

export const POSITIVE_REVIEWS = [
  'Sản phẩm đúng như mô tả, đóng gói cẩn thận. Sẽ ủng hộ shop tiếp!',
  'Giao hàng nhanh, chất lượng tốt, giá hợp lý. 5 sao cho shop.',
  'Rất hài lòng, sản phẩm dùng tốt, shop tư vấn nhiệt tình.',
  'Đóng gói kỹ, hàng đẹp như hình. Sẽ mua lại lần sau.',
  'Chất lượng vượt mong đợi, ship siêu nhanh luôn.',
  'Dùng thử thấy ok, đúng chuẩn chính hãng. Recommend nha mọi người.',
  'Shop phản hồi nhanh, đóng gói chắc chắn, hàng nguyên vẹn.',
  'Sản phẩm ổn trong tầm giá, sẽ ủng hộ shop dài dài.',
  'Đúng mẫu đúng màu, giao hàng đúng hẹn. Cảm ơn shop!',
  'Chất lượng tốt hơn mình nghĩ, đóng gói cẩn thận không móp méo.',
];

export const NEUTRAL_REVIEWS = [
  'Sản phẩm tạm ổn, giao hơi chậm so với dự kiến.',
  'Dùng được, không quá xuất sắc nhưng cũng không tệ.',
  'Đóng gói bình thường, sản phẩm đúng mô tả.',
  'Chất lượng ổn trong tầm giá, sẽ cân nhắc mua lại.',
  'Sản phẩm ok nhưng màu hơi khác so với hình.',
  'Tạm được, giao hàng đúng hẹn.',
];

export const NEGATIVE_REVIEWS = [
  'Giao hàng chậm hơn dự kiến, sản phẩm tạm chấp nhận được.',
  'Chất lượng không như mong đợi, hơi thất vọng.',
  'Sản phẩm bị lỗi nhỏ, đã liên hệ shop để đổi.',
  'Đóng gói sơ sài, sản phẩm bị móp khi nhận.',
  'Không giống hình lắm, chất lượng chưa ổn.',
  'Giao sai màu, đang chờ shop hỗ trợ đổi lại.',
];

export const SELLER_REPLIES = [
  'Cảm ơn bạn đã tin tưởng ủng hộ shop! Chúc bạn dùng hàng vui vẻ 🎉',
  'Shop cảm ơn bạn đã đánh giá, hẹn gặp lại trong lần mua sau nha!',
  'Cảm ơn bạn rất nhiều, shop sẽ cố gắng phục vụ tốt hơn nữa!',
  'Rất xin lỗi vì trải nghiệm chưa tốt, bạn inbox shop để được hỗ trợ đổi/trả nhé.',
  'Shop xin lỗi về sự cố này, mong bạn thông cảm và cho shop cơ hội khắc phục.',
  'Cảm ơn góp ý của bạn, shop sẽ cải thiện khâu đóng gói trong thời gian tới!',
];

export function reviewCommentFor(rating: number): string | null {
  // ~15% of reviews leave a star rating with no written comment, like real reviews.
  if (Math.random() < 0.15) return null;
  const pool = rating >= 4 ? POSITIVE_REVIEWS : rating === 3 ? NEUTRAL_REVIEWS : NEGATIVE_REVIEWS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function sellerReplyFor(rating: number): string | null {
  const replyChance = rating >= 4 ? 0.25 : 0.5; // sellers respond more to complaints
  if (Math.random() > replyChance) return null;
  const pool = rating >= 4 ? SELLER_REPLIES.slice(0, 3) : SELLER_REPLIES.slice(3);
  return pool[Math.floor(Math.random() * pool.length)];
}
