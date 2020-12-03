const express = require('express');
const router = express.Router();
const Category = require('../schemas/categories.schema');

/* create Category */
router.post('/create', async (req, res) => {
    try {
        const result = await Category.create({
           name: req.body.name
        });
        res.status(200).send(result);
    } catch (e) {
        res.status(404).send(e.message);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const result = await Category.findById(req.params.id);
        res.status(200).send(result);
    } catch (e) {
        res.status(404).send(e.message);
    }
});

router.get('/delete/:id', async (req, res) => {
    try {
        const result = await Category.findByIdAndDelete(req.params.id);
        res.status(200).send(result);
    } catch (e) {
        res.status(404).send(e.message);
    }
});

router.post('/update/:id', async (req, res) => {
    try {
        const result = await Wilt.update({ _id: req.params.id }, {
            name: req.body.name
        }, {omitUndefined: true, multi: false})
        res.status(200).send(result);
    } catch (e) {
        res.status(404).send(e.message);
    }
});

router.get('/', async (req, res) => {
    try {
        const result = await Category.find({});
        res.status(200).send(result);
    } catch (e) {
        res.status(404).send(e.message);
    }
});

module.exports = router;
