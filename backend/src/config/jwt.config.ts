import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET ?? 'financeapi-dev-secret',
  expiresIn: '1h',
}));

