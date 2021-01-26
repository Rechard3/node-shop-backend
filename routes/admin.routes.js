const express = require("express");


const router = express.Router();

router.use((req, res, next)=>{
    res.status(200).send({coco: 'chanelle'});
});

module.exports.adminRoutes = router;