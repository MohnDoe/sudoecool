import { authMiddleware } from '@/middleware/auth';
import gamesRouter from '@/routes/api/games';
import { createDiscordAuthRouter } from '@/routes/auth/discord';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

// Auth routes (public)
const discordAuth = createDiscordAuthRouter();
app.route('/auth/discord', discordAuth);

// Protected routes
app.use('/api/*', authMiddleware);

// app.route('/api/leaderboard', leaderboardRouter);
app.route('/api/games', gamesRouter);
// app.route('/api/friends', friendsRouter);

export default app;
