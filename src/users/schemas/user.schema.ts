import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';

@Schema({ timestamps: true })
export class User {
  @Prop({
    type: String,
    default: () => randomUUID(),
  })
  _id!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true, select: false }) //select false torna com que o mongo nao retorne essa prop por padrao nas consultas, no caso da senha, da mais segurança ainda
  password!: string;

  @Prop()
  bio!: string;

  @Prop()
  age!: number;

  @Prop({ default: 'user' })
  role!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
