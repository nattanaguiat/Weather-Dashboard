import { Router } from 'express';
import apiRoutes from './api/index.js';
import htmlRoutes from './htmlRoutes.js';


const router = Router();

// Use API routes for '/api'
router.use('/api', apiRoutes);


// Use HTML routes for '/'
router.use('/', htmlRoutes);

export default router;
