import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/error';
import bfhlRoutes from './routes/bfhl';

dotenv.config();

const app = express();
const configuredPort = process.env.PORT || 8080;

app.use(helmet());
app.use(corsMiddleware);
app.use(express.json());

app.use('/bfhl', bfhlRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(errorHandler);

app.listen(configuredPort, (startupFailure?: Error) => {
  if (startupFailure) {
    console.error(`Failed to start server on port ${configuredPort}:`, startupFailure.message);
    process.exit(1);
  }
});
