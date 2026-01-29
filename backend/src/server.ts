import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ RESORTS ============
app.get('/api/resorts', async (req, res) => {
  try {
    const resorts = await prisma.resort.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(resorts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resorts' });
  }
});

app.get('/api/resorts/:id', async (req, res) => {
  try {
    const resort = await prisma.resort.findUnique({
      where: { id: req.params.id },
      include: { runs: true }
    });
    if (!resort) return res.status(404).json({ error: 'Resort not found' });
    res.json(resort);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resort' });
  }
});

app.post('/api/resorts', async (req, res) => {
  try {
    const resort = await prisma.resort.create({ data: req.body });
    res.status(201).json(resort);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create resort' });
  }
});

app.put('/api/resorts/:id', async (req, res) => {
  try {
    const resort = await prisma.resort.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(resort);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update resort' });
  }
});

app.delete('/api/resorts/:id', async (req, res) => {
  try {
    await prisma.resort.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete resort' });
  }
});

// ============ RUNS ============
app.get('/api/runs', async (req, res) => {
  try {
    const { resort_id } = req.query;
    const runs = await prisma.run.findMany({
      where: resort_id ? { resortId: resort_id as string } : undefined,
      orderBy: { name: 'asc' }
    });
    res.json(runs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch runs' });
  }
});

app.get('/api/runs/:id', async (req, res) => {
  try {
    const run = await prisma.run.findUnique({
      where: { id: req.params.id },
      include: { resort: true, ratings: true, notes: true }
    });
    if (!run) return res.status(404).json({ error: 'Run not found' });
    res.json(run);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch run' });
  }
});

app.post('/api/runs', async (req, res) => {
  try {
    const run = await prisma.run.create({ data: req.body });
    res.status(201).json(run);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create run' });
  }
});

app.post('/api/runs/bulk', async (req, res) => {
  try {
    const runs = await prisma.run.createMany({ data: req.body });
    res.status(201).json(runs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to bulk create runs' });
  }
});

app.put('/api/runs/:id', async (req, res) => {
  try {
    const run = await prisma.run.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(run);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update run' });
  }
});

app.delete('/api/runs/:id', async (req, res) => {
  try {
    await prisma.run.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete run' });
  }
});

// ============ RATINGS ============
app.get('/api/ratings', async (req, res) => {
  try {
    const { run_id } = req.query;
    const ratings = await prisma.difficultyRating.findMany({
      where: run_id ? { runId: run_id as string } : undefined,
      orderBy: { createdAt: 'desc' }
    });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

app.post('/api/ratings', async (req, res) => {
  try {
    const rating = await prisma.difficultyRating.create({ data: req.body });
    res.status(201).json(rating);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create rating' });
  }
});

// ============ CONDITION NOTES ============
app.get('/api/notes', async (req, res) => {
  try {
    const { run_id } = req.query;
    const notes = await prisma.conditionNote.findMany({
      where: run_id ? { runId: run_id as string } : undefined,
      orderBy: { createdAt: 'desc' }
    });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const note = await prisma.conditionNote.create({ data: req.body });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// ============ COMPARISONS ============
app.get('/api/comparisons', async (req, res) => {
  try {
    const comparisons = await prisma.crossResortComparison.findMany({
      include: { run1: true, run2: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(comparisons);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comparisons' });
  }
});

app.post('/api/comparisons', async (req, res) => {
  try {
    const comparison = await prisma.crossResortComparison.create({ data: req.body });
    res.status(201).json(comparison);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create comparison' });
  }
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Whiteout API running on http://localhost:${PORT}`);
});
