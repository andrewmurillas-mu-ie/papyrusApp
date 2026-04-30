"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const router = (0, express_1.Router)();
router.post('/documents', async (req, res) => {
    var _a;
    try {
        const database = await index_1.db;
        const result = await database.collection('documents').insertOne({
            title: req.body.title,
            content: req.body.content,
            owner: ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || null, // adjust based on your auth
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const doc = await database.collection('documents').findOne({ _id: result.insertedId });
        res.json(doc);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to create document' });
    }
});
exports.default = router;
