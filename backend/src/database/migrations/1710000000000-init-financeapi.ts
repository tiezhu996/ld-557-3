import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitFinanceapi1710000000000 implements MigrationInterface {
  name = 'InitFinanceapi1710000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE portfolio_type AS ENUM ('STOCK','FUND','BOND','MIXED','CRYPTO')`);
    await queryRunner.query(`CREATE TYPE risk_level AS ENUM ('CONSERVATIVE','MODERATE','AGGRESSIVE')`);
    await queryRunner.query(`CREATE TYPE transaction_type AS ENUM ('BUY','SELL','DIVIDEND')`);
    await queryRunner.query(`CREATE TYPE asset_status AS ENUM ('ACTIVE','SUSPENDED','DELISTED')`);
    await queryRunner.query(`CREATE TYPE user_role AS ENUM ('USER','PREMIUM','ADMIN')`);
    await queryRunner.query(`CREATE TABLE users (id SERIAL PRIMARY KEY, email VARCHAR UNIQUE NOT NULL, password_hash VARCHAR NOT NULL, name VARCHAR NOT NULL, role user_role NOT NULL DEFAULT 'USER')`);
    await queryRunner.query(`CREATE TABLE portfolios (id SERIAL PRIMARY KEY, user_id INT NOT NULL REFERENCES users(id), name VARCHAR NOT NULL, description TEXT DEFAULT '', type portfolio_type NOT NULL, risk_level risk_level NOT NULL, total_value DECIMAL(18,2) DEFAULT 0, created_at TIMESTAMP DEFAULT now())`);
    await queryRunner.query(`CREATE TABLE holdings (id SERIAL PRIMARY KEY, portfolio_id INT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE, symbol VARCHAR NOT NULL, quantity DECIMAL(18,6) NOT NULL, avg_cost DECIMAL(18,4) NOT NULL, current_price DECIMAL(18,4) DEFAULT 0, pnl DECIMAL(18,2) DEFAULT 0)`);
    await queryRunner.query(`CREATE TABLE transactions (id SERIAL PRIMARY KEY, holding_id INT NOT NULL REFERENCES holdings(id) ON DELETE CASCADE, type transaction_type NOT NULL, quantity DECIMAL(18,6) NOT NULL, price DECIMAL(18,4) NOT NULL, fee DECIMAL(18,2) DEFAULT 0, executed_at TIMESTAMP NOT NULL)`);
    await queryRunner.query(`CREATE TABLE market_data (id SERIAL PRIMARY KEY, symbol VARCHAR UNIQUE NOT NULL, name VARCHAR NOT NULL, price DECIMAL(18,4) NOT NULL, change DECIMAL(18,4) DEFAULT 0, change_percent DECIMAL(8,4) DEFAULT 0, volume BIGINT DEFAULT 0, market_cap BIGINT DEFAULT 0, status asset_status NOT NULL DEFAULT 'ACTIVE', updated_at TIMESTAMP DEFAULT now())`);
    await queryRunner.query(`CREATE TABLE review_logs (id SERIAL PRIMARY KEY, portfolio_id INT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE, period VARCHAR NOT NULL, summary TEXT NOT NULL, decisions JSONB DEFAULT '[]', lessons TEXT DEFAULT '', created_at TIMESTAMP DEFAULT now())`);
    await queryRunner.query(`CREATE TABLE audit_logs (id SERIAL PRIMARY KEY, user_id INT, action VARCHAR NOT NULL, target VARCHAR NOT NULL, target_id VARCHAR, old_value JSONB, new_value JSONB, ip VARCHAR, user_agent VARCHAR, created_at TIMESTAMP DEFAULT now())`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS audit_logs, review_logs, market_data, transactions, holdings, portfolios, users CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS portfolio_type, risk_level, transaction_type, asset_status, user_role`);
  }
}

