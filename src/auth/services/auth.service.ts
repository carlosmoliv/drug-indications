import { Repository } from 'typeorm';
import { compare, genSalt, hash } from 'bcrypt';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { SignUpDto } from '../dtos/sign-up.dto';
import { SignInDto } from '../dtos/sign-in.dto';
import { ActiveUser } from '../interfaces/current-user.interface';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(dto: SignUpDto): Promise<void> {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }
    const hashedPassword = await hash(dto.password, await genSalt());
    await this.userRepository.save({ ...dto, password: hashedPassword });
  }

  async signIn({ email, password }: SignInDto) {
    const user = await this.userRepository.findOneBy({ email });

    const passwordMatch = user && (await compare(password, user.password));
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.tokenService.signToken<ActiveUser>(
      { userId: user.id },
      this.configService.get('ACCESS_TOKEN_TTL'),
    );
    return { accessToken };
  }
}
