import express, { Router } from 'express';
import {
  requestGrammarAssist,
  requestSaveSearchablePage,
  requestSmartSearch,
} from '../controllers/ai_controller';

const router: Router = express.Router();

router.post('/grammar', requestGrammarAssist);
router.post('/pages', requestSaveSearchablePage);
router.post('/search', requestSmartSearch);

export default router;
