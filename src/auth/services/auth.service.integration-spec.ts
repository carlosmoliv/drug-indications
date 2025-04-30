import { DataSource, Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { typeOrmTestConfig } from '../../test-utils/db/typeorm-test.config';
import { clearDatabase } from '../../test-utils/db/clear-database.util';
import { Role } from '../enums/role';
import { UserEntity } from '../entities/user.entity';
import { SignUpDto } from '../dtos/sign-up.dto';
import { AuthService } from './auth.service';

describe('AuthService Integration Tests', () => {
  let sut: AuthService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(typeOrmTestConfig),
        TypeOrmModule.forFeature([UserEntity]),
      ],
      providers: [AuthService],
    }).compile();

    sut = module.get<AuthService>(AuthService);
    await clearDatabase(module.get(DataSource));
  });

  afterAll(async () => {
    await module.close();
  });

  describe('signUp', () => {
    it('should register a User', async () => {
      // Arrange
      const dto: SignUpDto = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      // Act
      await sut.signUp(dto);

      // Assert
      const userFromDb = await module
        .get<Repository<UserEntity>>(getRepositoryToken(UserEntity))
        .findOne({ where: { email: dto.email } });

      expect(userFromDb).toEqual(
        expect.objectContaining({
          name: dto.name,
          email: dto.email,
          role: Role.User,
          password: expect.not.stringContaining(dto.password),
        }),
      );
    });
  });
});
