<?php

namespace App\Observers;

use App\Models\Review;

class ReviewObserver
{
    /**
     * Handle the Review "created" event.
     */
    public function created(Review $review): void
    {
        $this->recalculateRatings($review);
    }

    /**
     * Handle the Review "updated" event.
     */
    public function updated(Review $review): void
    {
        $this->recalculateRatings($review);
    }

    /**
     * Handle the Review "deleted" event (soft delete).
     */
    public function deleted(Review $review): void
    {
        $this->recalculateRatings($review);
    }

    /**
     * Handle the Review "restored" event.
     */
    public function restored(Review $review): void
    {
        $this->recalculateRatings($review);
    }

    /**
     * Recalculate rating & review_count on both the reviewee (User) and the product.
     */
    private function recalculateRatings(Review $review): void
    {
        if ($review->reviewee) {
            $review->reviewee->recalculateRating();
        }

        if ($review->product) {
            $review->product->recalculateRating();
        }
    }
}
