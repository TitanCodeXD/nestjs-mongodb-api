import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

//Importar o modelo do usuário para valdiar se ele existe no banco de dados e fazer um payload mais dinâmico
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

//Erors
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  //Payload mais extensõ, para caso, por exemplo, um usuario ao ser apagado, não consiga mais acessar a aplicação, mesmo que o token ainda seja válido. Quando o usuario é deletado por exemplo, o paylaosd continua ativo normalmente.
  async validate(payload: any) {
    const user = await this.userModel.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return user;
  }
}
