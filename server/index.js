import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeRoute } from './routes/analyze.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api', analyzeRoute);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'LabelGuard API' });
});

app.listen(PORT, () => {
  console.log(`LabelGuard server running on port ${PORT}`);
});
