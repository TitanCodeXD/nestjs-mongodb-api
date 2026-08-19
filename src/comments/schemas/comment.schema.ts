import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comment {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'Post',
  })
  post!: Types.ObjectId;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'User',
  })
  author!: Types.ObjectId;

  @Prop({ required: true })
  content!: string;

  @Prop({ default: 0 })
  likes!: number;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
