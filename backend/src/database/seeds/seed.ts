import { PortfolioType, RiskLevel, TransactionType, UserRole } from '../../constants/enums';

export const seedData = {
  users: [
    { id: 1, email: 'demo@finance.local', name: 'Demo User', role: UserRole.USER },
    { id: 2, email: 'admin@finance.local', name: 'Admin', role: UserRole.ADMIN },
  ],
  portfolios: [
    { id: 1, userId: 1, name: '长期价值组合', type: PortfolioType.MIXED, riskLevel: RiskLevel.MODERATE },
  ],
  transactions: [
    { holdingId: 1, type: TransactionType.BUY, quantity: 10, price: 180 },
  ],
};

