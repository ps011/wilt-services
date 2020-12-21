const express = require("express");
const router = express.Router();
const Wilt = require("../schemas/wilt.schema");

/* create WILT */
router.post("/create", async (req, res) => {
  try {
    const result = await Wilt.create({
      compact: req.body.compact,
      lengthy: req.body.lengthy,
      visuals: req.body.visuals,
      category: req.body.category,
      tags: req.body.tags,
      userId: req.body.userId,
      username: req.body.username,
      private: req.body.private,
      slug: req.body.compact.replace(/\s+/g, "-").toLowerCase(),
    });
    res.status(200).send(result);
  } catch (e) {
    res.status(404).send(e.message);
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const result = await Wilt.findOne({ slug: req.params.slug });
    res.status(200).send(result);
  } catch (e) {
    res.status(404).send(e.message);
  }
});

router.get("/delete/:id", async (req, res) => {
  try {
    const result = await Wilt.findByIdAndDelete(req.params.id);
    res.status(200).send(result);
  } catch (e) {
    res.status(404).send(e.message);
  }
});

router.post("/update/:id", async (req, res) => {
  try {
    const result = await Wilt.update(
      { _id: req.params.id },
      {
        compact: req.body.compact,
        lengthy: req.body.lengthy,
        visuals: req.body.visuals,
      },
      { omitUndefined: true, multi: false }
    );
    res.status(200).send(result);
  } catch (e) {
    res.status(404).send(e.message);
  }
});

router.get("/", async (req, res) => {
  try {
    const tags = req.query.tags && req.query.tags.split(",");
    const categories = req.query.category && req.query.category.split(",");
    let result;
    const query = { $or: [] };
    if (tags) {
      query.$or.push({ tags: { $in: tags } });
    }
    if (categories) {
      query.$or.push({
        $or: categories.map((category) => {
          return { category };
        }),
      });
    }
    if (query.$or.length > 0) {
      result = await Wilt.paginate(query, {
        page: req.query.page,
        limit: req.query.limit,
      });
    } else {
      result = await Wilt.paginate(
        {},
        { page: req.query.page, limit: req.query.limit }
      );
    }
    res.status(200).send(result);
  } catch (e) {
    res.status(404).send(e.message);
  }
});

module.exports = router;
