import { User } from 'src/users/entities/user.entity';
import { UserAuth } from 'src/users/entities/userAuth.entity';
import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'brints-estate-backend',
  synchronize: true,
  entities: [User, UserAuth],
  //   entities: [__dirname + '/**/*.entity{.ts,.js}'],
});

export async function initializeDataSource() {
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

export default AppDataSource;
