import express from 'express';

import fileRoute from './routes/fileRoute';
import MessageResponse from '../interfaces/MessageResponse';

const router = express.Router();

router.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'routes: /upload, /delete',
  });
});

router.use('/', fileRoute);

export default router;
