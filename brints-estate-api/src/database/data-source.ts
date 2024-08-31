import { DataSource } from 'typeorm';

import { User } from 'src/users/entities/user.entity';
import { UserAuth } from 'src/users/entities/userAuth.entity';

const isDevelopment = process.env.NODE_ENV === 'development';

interface DataSourceConfig {
  dbHost: string;
  dbPort: number;
  dbUser: string;
  dbPassword: string;
  dbName: string;
}

export function createDataSource(config: DataSourceConfig) {
  return new DataSource({
    type: 'postgres',
    host: config.dbHost,
    port: config.dbPort,
    username: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
    synchronize: isDevelopment,
    entities: [User, UserAuth],
  });
}

export async function initializeDataSource(AppDataSource: DataSource) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    return AppDataSource;
  } catch (error) {
    console.error('Failed to initialize data source', error);
    throw error;
  }
}
