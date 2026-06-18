import { UserRole } from './enums';

export const ROLE_LIMITS: Record<UserRole, { rpm: number; maxPortfolios: number }> = {
  [UserRole.USER]: { rpm: 60, maxPortfolios: 5 },
  [UserRole.PREMIUM]: { rpm: 120, maxPortfolios: 25 },
  [UserRole.ADMIN]: { rpm: 240, maxPortfolios: 999 },
};

export const RBAC_MATRIX = {
  auth: [UserRole.USER, UserRole.PREMIUM, UserRole.ADMIN],
  portfolios: [UserRole.USER, UserRole.PREMIUM, UserRole.ADMIN],
  holdings: [UserRole.USER, UserRole.PREMIUM, UserRole.ADMIN],
  transactions: [UserRole.USER, UserRole.PREMIUM, UserRole.ADMIN],
  market: [UserRole.USER, UserRole.PREMIUM, UserRole.ADMIN],
  adminMarketWrite: [UserRole.ADMIN],
} as const;

