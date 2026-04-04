"use strict";

const { onRequest } = require("firebase-functions/v2/https");
const { searchSpoonacularRecipes } = require("./spoonacular");

exports.searchRecipes = onRequest({ cors: true }, async (req, res) => {
  try {
    const query = req.query.query || "";
    const offset = Number(req.query.offset || 0);

    const data = await searchSpoonacularRecipes(query, {}, offset);

    const recipes = data.results || [];
    const total = data.totalResults || 0;

    const nextOffset = offset + recipes.length;
    const hasMore = nextOffset < total;

    res.status(200).json({
      recipes,
      hasMore,
      nextOffset,
    });
  } catch (error) {
    console.error("searchRecipes error:", error);

    res.status(500).json({
      recipes: [],
      hasMore: false,
      nextOffset: 0,
      error: error.message,
    });
  }
});
