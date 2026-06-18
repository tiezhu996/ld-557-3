import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../constants/enums';
import { comparePassword, hashPassword } from '../../utils/crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

interface UserRecord {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  private users: UserRecord[] = [];
  private nextId = 1;

  constructor(private readonly jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    if (this.users.some((user) => user.email === dto.email)) {
      throw new BadRequestException('email already registered');
    }
    const user: UserRecord = {
      id: this.nextId++,
      email: dto.email,
      name: dto.name,
      role: dto.role ?? UserRole.USER,
      passwordHash: await hashPassword(dto.password),
    };
    this.users.push(user);
    return this.issueToken(user);
  }

  async login(dto: LoginDto) {
    const user = this.users.find((item) => item.email === dto.email);
    if (!user || !(await comparePassword(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('invalid credentials');
    }
    return this.issueToken(user);
  }

  refresh(user: { id: number; email: string; role: UserRole }) {
    return this.issueToken({ ...user, name: user.email });
  }

  profile(user: { id: number; email: string; role: UserRole }) {
    return user;
  }

  private issueToken(user: Pick<UserRecord, 'id' | 'email' | 'role' | 'name'>) {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return {
      accessToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }
}
