import { Repository } from 'typeorm';
import { genSalt, hash } from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user';
import { SignUpDto } from '../dtos/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async signUp(dto: SignUpDto): Promise<void> {
    const hashedPassword = await hash(dto.password, await genSalt());
    await this.userRepository.save({ ...dto, password: hashedPassword });
  }
}
