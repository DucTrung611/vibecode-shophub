import type { PrismaClient } from '../../../generated/prisma/client';
import { reviewCommentFor, sellerReplyFor } from '../data/review-phrases';
import { gaussian, pickMany, randomInt } from '../lib/random';
import type { ReviewCandidate } from './07-orders';

const REVIEW_SHARE = 0.4; // ~40% of eligible (delivered) order items get reviewed

/** Each product gets a stable "quality center" so its own reviews cluster around a
 * believable average (3.8-4.6 overall), rather than every review being independently
 * uniform 1-5. ~8% of individual reviews are long-tail complaints regardless of the
 * product's usual quality — that's what keeps a handful of 1-2 star reviews around
 * even on well-liked products, matching real review distributions. */
function buildQualityCenters(productIds: number[]): Map<number, number> {
  const centers = new Map<number, number>();
  for (const id of productIds) {
    centers.set(id, gaussian(4.2, 0.35, 3.2, 4.9));
  }
  return centers;
}

function pickRating(qualityCenter: number): number {
  if (Math.random() < 0.08) return randomInt(1, 2);
  const raw = gaussian(qualityCenter, 0.7, 1, 5);
  return Math.round(raw);
}

export async function seedReviews(
  prisma: PrismaClient,
  candidates: ReviewCandidate[],
): Promise<void> {
  if (candidates.length === 0) {
    console.log('  No delivered order items — skipping reviews');
    return;
  }

  const reviewed = pickMany(candidates, Math.round(candidates.length * REVIEW_SHARE));
  const qualityCenters = buildQualityCenters([...new Set(reviewed.map((c) => c.productId))]);

  const rows = reviewed.map((candidate) => {
    const center = qualityCenters.get(candidate.productId) ?? 4.2;
    const rating = pickRating(center);
    return {
      productId: candidate.productId,
      orderItemId: candidate.orderItemId,
      userId: candidate.buyerId,
      rating,
      comment: reviewCommentFor(rating),
      sellerReply: sellerReplyFor(rating),
      createdAt: candidate.orderDeliveredAt,
    };
  });

  const CHUNK_SIZE = 200;
  let created = 0;
  for (let start = 0; start < rows.length; start += CHUNK_SIZE) {
    const chunk = rows.slice(start, start + CHUNK_SIZE);
    await prisma.review.createMany({ data: chunk });
    created += chunk.length;
    console.log(`  Seeded ${created}/${rows.length} reviews...`);
  }
}
