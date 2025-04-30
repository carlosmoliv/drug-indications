import { Repository } from 'typeorm';
import { genSalt, hash } from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { SignUpDto } from '../dtos/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async signUp(dto: SignUpDto): Promise<void> {
    const hashedPassword = await hash(dto.password, await genSalt());
    await this.userRepository.save({ ...dto, password: hashedPassword });
  }
}
