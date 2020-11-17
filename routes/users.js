var express = require('express');
var router = express.Router();
const User = require('../schemas/user.schema');
const jwt = require('jsonwebtoken');
const fs = require('fs');
/* GET users listing. */
router.post('/login', async(req, res) => {
    try {
        const result = await User.findOne({ username: req.body.username,  password: req.body.password});
        if (result) {
            console.log(result)
            const jwtBearerToken = jwt.sign({username: result.username, password: result.password}, fs.readFileSync(`${process.cwd()}/private.key`), {
                algorithm: 'RS256',
                expiresIn: '10h',
                subject: req.body.username
            })
            res.status(200).send(jwtBearerToken);
        } else {
            res.status(404).send('User not found');
        }
    } catch (e) {
        res.status(404).send(e.message);
    }
});

module.exports = router;
