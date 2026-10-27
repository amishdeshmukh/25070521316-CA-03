
const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET ALL PRODUCTS OR SEARCH PRODUCTS
router.get("/", async (req, res) => {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim().slice(0, 80)
        : "";

    const filter = search
      ? {
          $or: [
            {
              name: {
                $regex: escapeRegex(search),
                $options: "i",
              },
            },
            {
              category: {
                $regex: escapeRegex(search),
                $options: "i",
              },
            },
            {
              description: {
                $regex: escapeRegex(search),
                $options: "i",
              },
            },
          ],
        }
      : {};

    const products = await Product.find(filter)
      .sort({ createdAt: 1 })
      .limit(100)
      .lean();

    return res.json(products);
  } catch (error) {
    console.error("Product loading error:", error.message);

    return res.status(500).json({
      message: "Unable to load products.",
    });
  }
});

module.exports = router;
