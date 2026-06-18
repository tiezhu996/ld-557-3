import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  ttl: {
    quote: 60,
    history: 300,
    search: 600,
  },
}));

