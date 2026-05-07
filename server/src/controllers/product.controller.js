const Product = require("../models/product/product.mongo");

async function httpCreateProduct(req, res) {
  const { name, description, price, category, stock, brand, images } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({
      error: "Name, price, and category are required",
    });
  }

  try {
    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock: stock || 0,
      brand,
      images: images || [],
      createdBy: req.user.id,
    });

    return res.status(201).json({
      message: " Product created successfully",
      product: {
        id: product._id,
        name: product.name,
        price: product.price,
        category: product.category,
        stock: product.stock,
      },
    });
  } catch (err) {
    console.error("Create product error:", err);

    if (err.name === "Validation Error") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
    }

    return res.status(500).json({
      error: "Failed to create product",
    });
  }
}

async function httpGetAllProducts(req, res) {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category) {
      const validCategories = [
        "Electronics",
        "Clothing",
        "Books",
        "Home",
        "Sports",
        "Other",
      ];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          error: "Invalid category",
          validCategories: validCategories,
        });
      }
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};

      if (minPrice) {
        const min = parseFloat(minPrice);
        if (isNaN(min) || min < 0) {
          return res.status(400).json({
            error: "Invalid minPrice",
          });
        }
        query.price.$gte = min;
      }

      if (maxPrice) {
        const max = parseFloat(maxPrice);
        if (isNaN(max) || max < 0) {
          return res.status(400).json({
            error: "Invalid maxPrice",
          });
        }
        query.price.$lte = max;
      }
    }

    if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
      return res.status(400).json({
        error: "minPrice cannot be greater than maxPrice",
      });
    }

    let sortOption = {};

    if (sort) {
      const validSorts = [
        "price",
        "-price",
        "-name",
        "createdAt",
        "-createdAt",
        "-averageRating",
      ];

      if (!validSorts.includes(sort)) {
        return res.status(400).json({
          error: "Invalid sort parameters",
          validSorts: validSorts,
        });
      }

      if (sort.startsWith("-")) {
        const field = sort.substring(1);
        sortOption[field] = -1;
      } else {
        sortOption[sort] = 1;
      }
    } else {
      sortOption.createdAt = -1;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        error: "Invalid page number",
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        error: "Invalid limit(must be 1-100)",
      });
    }

    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(query)
      .select("-createdBy -__v")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limitNum);

    return res.status(200).json({
      products: products,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalProducts: totalProducts,
        productsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
      },
    });
  } catch (err) {
    console.error("Get product error:", err);
    return res.status(500).json({
      error: "Failed to get products",
    });
  }
}

async function httpGetProduct(req, res) {
  const { id } = req.params;

  try {
    const product = await Product.findById(id).select("-createdBy -__v");

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    return res.status(200).json({
      product,
    });
  } catch (err) {
    console.error("Get product error:", err);

    if (err.kind === "ObjectId") {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    return res.status(500).json({
      error: "Failed to get product",
    });
  }
}

async function httpUpdateProduct(req, res) {
  const { id } = req.params;
  const { name, description, price, category, stock, brand, images } = req.body;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (brand !== undefined) product.brand = brand;
    if (images !== undefined) product.images = images;

    await product.save();

    return res.status(200).json({
      message: "Product updated successfully",
      product: {
        id: product._id,
        name: product.name,
        price: product.price,
        category: product.category,
        stock: product.stock,
      },
    });
  } catch (err) {
    console.error("Update product error:", err);

    if (err.name === "ValidatiorError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
    }

    if (err.kind === "ObjectId") {
      return res.status(404).json({
        error: "product not found",
      });
    }

    return res.status(500).json({
      error: "Failed to update product",
    });
  }
}

async function httpDeleteProduct(req, res) {
  const { id } = req.params;

  try {
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product deleted sucessfully",
    });
  } catch (err) {
    console.error("Delete product error:", err);

    if (err.kind === "objectId") {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    return res.status(500).json({
      error: "Failed to delete product",
    });
  }
}

module.exports = {
  httpCreateProduct: httpCreateProduct,
  httpGetAllProducts: httpGetAllProducts,
  httpGetProduct: httpGetProduct,
  httpUpdateProduct: httpUpdateProduct,
  httpDeleteProduct: httpDeleteProduct,
};
