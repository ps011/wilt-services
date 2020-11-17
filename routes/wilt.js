const express = require('express');
const router = express.Router();
const Wilt = require('../schemas/wilt.schema');

/* create WILT */
router.post('/create', async (req, res) => {
    try {
        const result = await Wilt.create({
            compact: req.body.compact,
            lengthy: req.body.lengthy,
            visuals: req.body.visuals,
            userId: req.body.userId,
        });
        res.status(200).send(result);
    } catch (e) {
        res.status(404).send(e.message);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const result = await Wilt.find({ userId: req.params.id });
        res.status(200).send(result);
    } catch (e) {
        res.status(404).send(e.message);
    }
});

router.get('/delete/:id', async (req, res) => {
    try {
        const result = await Wilt.findByIdAndDelete(req.params.id);
        res.status(200).send(result);
    } catch (e) {
        res.status(404).send(e.message);
    }
});

router.post('/update/:id', async (req, res) => {
    try {
        const result = await about.update({ _id: req.params.id }, {
            compact: req.body.compact,
            lengthy: req.body.lengthy,
            visuals: req.body.visuals
        }, {omitUndefined: true, multi: false})
        res.status(200).send(result);
    } catch (e) {
        res.status(404).send(e.message);
    }
});

module.exports = router;
