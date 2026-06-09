import { Router } from 'express';
import * as goal from '../controllers/goalController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', goal.getGoals);
router.post('/', goal.createGoal);
router.put('/:id', goal.updateGoal);
router.post('/:id/add', goal.addToGoal);
router.delete('/:id', goal.deleteGoal);

export default router;
