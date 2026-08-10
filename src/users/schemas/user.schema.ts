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

  @Prop({ required: true })
  password!: string;

  @Prop()
  bio!: string;

  @Prop()
  age!: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
