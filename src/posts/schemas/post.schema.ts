import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Post {
  //Aqui nao precisa de ID, pode ser o ID que o próprio mongoDB cria mesmo, é o suficiente para indexar cada post.
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ default: 0 })
  likes!: number;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' }) //Ref user ja que o post vai pegar o usuario que esta logado ja, ou seja, vai referenciar o author ao user ja logado
  author!: Types.ObjectId;
}

export const PostSchema = SchemaFactory.createForClass(Post);
