import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User } from '../users/schemas/user.schema';
import { LoginDto } from './dto/login.dto';

import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    private readonly jwtService: JwtService,
  ) {}

  //Lógica do Login
  async login(loginDto: LoginDto) {
    const user = await this.userModel
      .findOne({
        email: loginDto.email,
      })
      .select('+password'); //select password, porque por padrao definimos para o password nao vir com consultas, mas nesse caso para login é necessario, precisamos comparar a senha do login com a senha do banco de dados.

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user._id,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Login successfull',
      access_token: accessToken,
      id: user._id,
    };
  }

  //Verify-Email
  async verifyEmail(token: string) {
    const user = await this.userModel.findOne({
      emailVerificationToken: token,
    });

    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;

    await user.save();

    return user;
  }
}
