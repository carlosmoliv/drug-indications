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
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { SignInDto } from '../dtos/sign-in.dto';
import { TokenService } from './token.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

describe('AuthService Integration Tests', () => {
  let sut: AuthService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        JwtModule.registerAsync({
          useFactory: (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
          }),
          inject: [ConfigService],
        }),
        TypeOrmModule.forRoot(typeOrmTestConfig),
        TypeOrmModule.forFeature([UserEntity]),
      ],
      providers: [AuthService, TokenService],
    }).compile();

    sut = module.get<AuthService>(AuthService);
  });

  beforeEach(async () => {
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

    it('should prevent registration using an existing email address', async () => {
      // Arrange
      const dto: SignUpDto = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      await module
        .get<Repository<UserEntity>>(getRepositoryToken(UserEntity))
        .save(dto);

      // Act
      const promise = sut.signUp(dto);

      // Assert
      await expect(promise).rejects.toThrow(ConflictException);
    });
  });

  describe('signIn', () => {
    it('should authenticate a user and return the access token', async () => {
      // Arrange
      const signUpDto: SignUpDto = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      await sut.signUp(signUpDto);

      const signInDto: SignInDto = {
        email: signUpDto.email,
        password: signUpDto.password,
      };

      // Act
      const token = await sut.signIn(signInDto);

      // Assert
      expect(token).toEqual({ accessToken: expect.any(String) });
    });

    it('should deny authentication if user does not exist', async () => {
      // Arrange
      const signInDto: SignInDto = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      // Act
      const promise = sut.signIn(signInDto);

      // Assert
      await expect(promise).rejects.toThrow(UnauthorizedException);
    });

    it('should deny authentication if password does not match', async () => {
      // Arrange
      const signUpDto: SignUpDto = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      await sut.signUp(signUpDto);

      // Act
      const promise = sut.signIn({
        email: signUpDto.email,
        password: faker.internet.password(),
      });

      // Assert
      await expect(promise).rejects.toThrow(UnauthorizedException);
    });
  });
});
