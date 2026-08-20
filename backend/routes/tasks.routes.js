import { Router } from 'express';
import { upload } from '../services/upload.service.js';
import {
  listTasks,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
  addAttachment,
  removeAttachment,
  listAttachments,
} from '../controllers/tasks.controller.js';

const router = Router();

router.get('/', listTasks);
router.post('/', createTaskHandler);
router.put('/:id', updateTaskHandler);
router.delete('/:id', deleteTaskHandler);
router.post('/:id/attachments', upload.single('file'), addAttachment);
router.delete('/:id/attachments/:attachmentId', removeAttachment);
router.get('/:id/attachments', listAttachments);

export default router;