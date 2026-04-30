import { Router } from 'express';
import { db } from '../index';

const router = Router();

router.post('/documents', async (req, res) => {
  try {
    const database = await db;
    const result = await database.collection('documents').insertOne({
      title: req.body.title,
      content: req.body.content,
      owner: (req.user as any)?._id || null, // adjust based on your auth
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    const doc = await database.collection('documents').findOne({ _id: result.insertedId });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create document' });
  }
});

export default router;