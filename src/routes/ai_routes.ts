import express, { Router } from 'express';
import { requestGrammarAssist } from '../controllers/ai_controller';

const router: Router = express.Router();

router.post('/grammar', requestGrammarAssist);

export default router;
