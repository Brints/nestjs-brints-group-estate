import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
//import { DataSource, Repository } from 'typeorm';
import { HttpStatus } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { CustomException } from 'src/exceptions/custom.exception';
import { UserRole } from 'src/enums/user-role.enum';
import { IActiveUser } from 'src/auth/interfaces/active-user.interface';
import { GetUserProfileProvider } from './get-user-profile.provider';

describe('GetUserProfileProvider', () => {
  let provider: GetUserProfileProvider;
  //let userRepository: Repository<User>;

  const mockRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserProfileProvider,
        //{ provide: DataSource, useValue: {} },
        { provide: getRepositoryToken(User), useValue: mockRepository },
      ],
    }).compile();

    provider = module.get<GetUserProfileProvider>(GetUserProfileProvider);
    //userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should define get user profile provider', async function () {
    expect(provider).toBeDefined();
  });

  describe('getUserProfile', () => {
    const loggedInUser: IActiveUser = {
      sub: '1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'test@example.com',
      phone_number: '1234567890',
      verified: true,
      role: UserRole.SUPER_ADMIN,
    };

    it('should throw if user does not exist', async () => {
      const userId = '2';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        provider.getUserProfile(loggedInUser, userId),
      ).rejects.toThrow(
        new CustomException(HttpStatus.NOT_FOUND, 'User does not exist'),
      );
    });

    it('should throw if user is not authorized to view profile', async () => {
      const loggedInUser: IActiveUser = {
        sub: '1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'test@example.com',
        phone_number: '1234567890',
        verified: true,
        role: UserRole.USER,
      };
      const userId = '2';

      mockRepository.findOne.mockResolvedValue({
        id: userId,
      });

      await expect(
        provider.getUserProfile(loggedInUser, userId),
      ).rejects.toThrow(
        new CustomException(
          HttpStatus.FORBIDDEN,
          "You're not authorized to view this profile.",
        ),
      );
    });

    it('should return user profile', async () => {
      const userId = '1';

      mockRepository.findOne.mockResolvedValue({
        id: userId,
      });

      const user = await provider.getUserProfile(loggedInUser, userId);

      expect(user).toEqual({
        id: userId,
      });
    });
  });
});
