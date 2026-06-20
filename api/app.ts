/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js';
import jobsRoutes from './routes/jobs.js';
import contractsRoutes from './routes/contracts.js';
import tasksRoutes from './routes/tasks.js';
import settlementsRoutes from './routes/settlements.js';
import payoutsRoutes from './routes/payouts.js';
import invoicesRoutes from './routes/invoices.js';
import riskRoutes from './routes/risk.js';
import disputesRoutes from './routes/disputes.js';
import dashboardRoutes from './routes/dashboard.js';

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/settlements', settlementsRoutes);
app.use('/api/payouts', payoutsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/disputes', disputesRoutes);
app.use('/api/dashboard', dashboardRoutes);

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
