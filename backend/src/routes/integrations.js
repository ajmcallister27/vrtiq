import express from 'express';
import multer from 'multer';
import {
  invokeLLM,
  uploadFile,
  uploadPrivateFile,
  createFileSignedUrl,
  extractDataFromUploadedFile
} from '../controllers/integrations.js';
import { requireAuth, attachUser } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Attach user so we can know who is making the call when needed
router.use(attachUser);

router.post('/Core/InvokeLLM', invokeLLM);
router.post('/Core/UploadFile', requireAuth, upload.single('file'), uploadFile);
router.post('/Core/UploadPrivateFile', requireAuth, upload.single('file'), uploadPrivateFile);
router.post('/Core/CreateFileSignedUrl', requireAuth, createFileSignedUrl);
router.post('/Core/ExtractDataFromUploadedFile', requireAuth, extractDataFromUploadedFile);

export default router;
