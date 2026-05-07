const mongoose = require("mongoose");

const Review = require("../models/reviews/review.mongo");
const Product = require("../models/product/product.mongo");
const Order = require("../models/product/order.mongo");

async function httpCreateReview(req, res) {
  const { productId } = req.params;
  const userId = req.user.id;
  const { rating, title, comment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(404).json({
      error: "Product not found",
    });
  }

  if (!rating || !title || !comment) {
    return res.status(400).json({
      error: "Rating, title, and comment are required",
    });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({
      error: "Rating must be between 1 and 5",
    });
  }

  if (title.trim().length === 0 || title.length > 100) {
    return res.status(400).json({
      error: "Comment must between 1 and 100 characters",
    });
  }

  if (comment.trim().legnth === 0 || comment.length > 1000) {
    return res.status(400).json({
      error: "Comments must be between 1 and 1000 characters",
    });
  }

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    const existingReview = await Review.findOne({
      productId: productId,
      userId: userId,
    });

    if (existingReview) {
      return res.status(400).json({
        error:
          "You have already reviewed this product. Use update to modify your review",
      });
    }

    const order = await Order.findOne({
      userId: userId,
      "items.name.productId": productId,
      status: { $in: ["delivered", "processing", "shipped"] },
    });

    const isVerifiedPurchase = !!order;

    const review = new Review({
      productId: productId,
      userId: userId,
      rating: rating,
      title: title.trim(),
      comment: comment.trim(),
      isVerifiedPurchase: isVerifiedPurchase,
    });

    await review.save();

    await updateProductRating(productId);

    await review.populate("userId", "name");

    return res.status(201).json({
      message: "Review created successfully",
      review: {
        id: review._id,
        productId: review.productId,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        isVerifiedPurchase: review.isVerifiedPurchase,
        user: {
          name: review.userId.name,
        },
        createdAt: review.createdAt,
      },
    });
  } catch (err) {
    console.error("Create review error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        error: "You have already this product",
      });
    }

    return res.status(500).json({
      error: "Failed to create review",
    });
  }
}

async function httpGetProductReviews(req, res) {
  const { productId } = req.params;
  const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(404).json({
      error: "Product not found",
    });
  }

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    let sortOption = {};
    if (sort === "rating" || sort === "rating") {
      sortOption.rating = sort.startsWith("-") ? -1 : 1;
    } else {
      sortOption.createdAt = sort.startsWith("-") ? -1 : 1;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const reviews = await Review.find({ productId: productId })
      .populate("userId", "name")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const totalReviews = await Review.countDocuments({ productId: productId });
    const totalPages = Math.ceil(totalReviews / limitNum);

    const formattedReviews = reviews.map((review) => ({
      id: review._id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      isVerifiedPurchase: review.isVerifiedPurchase,
      user: {
        name: review.userId.name,
      },
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    }));

    return res.status(200).json({
      productId: productId,
      averageRating: product.averageRating,
      totalReviews: totalReviews,
      reviews: formattedReviews,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalReviews: totalReviews,
        reviewsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
      },
    });
  } catch (err) {
    console.error("Get product reviews error:", err);
    return res.status(500).json({
      error: "Failed to get reviews",
    });
  }
}

async function httpGetReview(req, res) {
  const { reviewId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    return res.status(404).json({
      error: "Review not found",
    });
  }

  try {
    const review = await Review.findById(reviewId)
      .populate("userId", "name")
      .populate("productId", "name images");

    if (!review) {
      return res.status(404).json({
        error: "Review not found",
      });
    }

    return res.status(200).json({
      review: {
        id: review._id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        isVerifiedPurchase: review.isVerifiedPurchase,
        user: {
          name: review.userId.name,
        },
        product: {
          id: review.productId._id,
          name: review.productId.name,
          image: review.productId.images[0],
        },
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      },
    });
  } catch (err) {
    console.error("Get review error:", err);
    return res.status(500).json({
      error: "Failed to get review",
    });
  }
}

async function httpUpdateReview(req, res) {
  const { reviewId } = req.params;
  const userId = req.user.id;
  const { rating, title, comment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    return res.status(404).json({
      error: "Review not found",
    });
  }

  try {
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        error: "Review not found",
      });
    }

    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        error: "You can only update your own reviews",
      });
    }

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          error: "Rating must be between 1 and 5",
        });
      }
      review.rating = rating;
    }

    if (title !== undefined) {
      if (title.trim().length === 0 || title.length > 100) {
        return res.status(400).json({
          error: "Title must be between 1 and 100 characters",
        });
      }
    }

    if (comment !== undefined) {
      if (comment.trim().length === 0 || comment.length > 1000) {
        return res.status(400).json({
          error: "Comment must be between 1 and 100 characters",
        });
      }
      review.comment = comment.trim();
    }

    await review.save();

    if (rating !== undefined) {
      await updateProductRating(review.productId);
    }

    return res.status(200).json({
      message: "Review updated successfully",
      review: {
        id: review._id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        updatedAt: review.updatedAt,
      },
    });
  } catch (err) {
    console.error("Update review erroe:", err);
    return res.status(500).json({
      error: "Failed to update review",
    });
  }
}

async function httpDeleteReview(req, res) {
  const { reviewId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    return res.status(404).json({
      error: "Review not found",
    });
  }

  try {
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        error: "REview not found",
      });
    }

    const isAuthor = review.userId.toString() === userId.toString();
    const isAdmin = userRole === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        error: "You can only delete your own reviews",
      });
    }

    const productId = review.productId;

    await Review.findByIdAndDelete(reviewId);

    await updateProductRating(productId);

    return res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (err) {
    console.error("Delete review error:", err);
    return res.status(500).json({
      error: "Failed to delete review",
    });
  }
}

async function httpGetUserReviews(req, res) {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;

  try {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const reviews = await Review.find({ userId: userId })
      .populate("productId", "name images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalReviews = await Review.countDocuments({ userId: userId });
    const totalPages = Math.ceil(totalReviews / limitNum);

    const formattedReviews = reviews.map((review) => ({
      id: review._id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      isVerifiedPurchase: review.isVerifiedPurchase,
      product: {
        id: review.productId._id,
        name: review.productId.name,
        image: review.productId.images[0],
      },
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    }));

    return res.status(200).json({
      totalReviews: totalReviews,
      reviews: formattedReviews,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalReviews: totalReviews,
        reviewsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
      },
    });
  } catch (err) {
    console.error("Get user review error:", err);
    return res.status(500).json({
      error: "Failed to get reviews",
    });
  }
}

async function updateProductRating(productId) {
  try {
    const reviews = await Review.find({ productId: productId });
    const totalReviews = reviews.length;

    let averageRating = 0;

    if (totalReviews > 0) {
      const sumRatings = reviews.reduce(
        (sum, review) => sum + review.rating,
        0,
      );
      averageRating = Math.round((sumRatings / totalReviews) * 10) / 10;
    }

    await Product.findByIdAndUpdate(productId, {
      avaerageRating: averageRating,
      totalReviews: totalReviews,
    });

    console.log(
      `Updated product ${productId}: ${averageRating} stars (${totalReviews} reviews)`,
    );
  } catch (err) {
    console.error("Update product rating error:", err);
  }
}

module.exports = {
  httpCreateReview: httpCreateReview,
  httpGetProductReviews: httpGetProductReviews,
  httpGetReview: httpGetReview,
  httpDeleteReview: httpDeleteReview,
  httpUpdateReview: httpUpdateReview,
  httpGetUserReviews: httpGetUserReviews,
};
