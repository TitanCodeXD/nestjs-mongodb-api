import { Injectable } from '@nestjs/common';

//Errors
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

//Model Injection
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from './schemas/comment.schema';

//Dto
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Post } from '../posts/schemas/post.schema';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<Comment>,

    @InjectModel(Post.name)
    private readonly postModel: Model<Post>,
  ) {}

  //findAllComments
  async findAllComments() {
    const coments = await this.commentModel.find();
    //Optei por deixar opcional o populate nesse caso, é mais para facilitar na construção da api
    /*.populate('post', 'title')
      .populate('author', 'name');*/

    return coments;
  }

  //findCommentById
  async findCommentById(id: string) {
    //id válido?
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid post ID');
    }

    const comment = await this.commentModel
      .findById(id)
      .populate('post', 'title')
      .populate('author', 'name');

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  //Create Comment
  async createComment(
    postId: string,
    createDocumentDtto: CreateCommentDto,
    user: User,
  ) {
    //id válido?
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('Invalid post ID');
    }

    //Primeiro verificar se o post existe
    const post = await this.postModel.findById(postId); // ID do post passado pelos parametros da rota

    //não achou esse post?
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    // Se exite, vamos dar um commentModel.create() e dar populate no post com o mentario que foi criado, mas passando o author do comment como o user que esta no payload do jwt que é o req.user
    const comment = await this.commentModel.create({
      ...createDocumentDtto,
      post: post._id,
      author: user._id,
    });

    //Agora precisamos popular primeiro o comentario DEPOIS o post, é tipo um populate por vez, como o comentario esta abaixo na hierarquia, vamos puplar ele primeiro, depois vamos popular o post com esse comentario criado
    await comment.populate('author', 'name');

    //Comentario criado, agora precisamos popular o post com esse comentario
    return comment;
  }

  //Find all comments of a post
  async findPostComments(postId: string) {
    // Verifica se o ID possui formato válido de ObjectId
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('Invalid post ID');
    }

    // Verifica se o Post realmente existe
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Busca todos os comentários desse Post
    const comments = await this.commentModel
      .find({
        post: new Types.ObjectId(postId), //Por algum motivo o casting automatico do schema nao foi, entao tive que deixar explicito que é esperado um objectId, foram uns bons minutos para debuggar isso
      })
      .sort({ createdAt: -1 })
      .populate('author', 'name')
      .populate('post', 'title');

    return comments;
  }

  //Update comment
  async updateComment(
    id: string,
    updateCommentDto: UpdateCommentDto,
    user: User,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid comment ID');
    }

    //Achar o comment
    const comment = await this.commentModel.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    //Verificação se o que voce quer dar update te pertence ou não - OU É ADMIN SUPREMO (apenas para fins de testes, facilita)
    const isOwner = user._id.toString() === comment.author.toString();
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only update your own comment');
    }

    await this.commentModel.findByIdAndUpdate(id, updateCommentDto, {
      returnDocument: 'after',
    });

    return {
      message: 'Comment updated successfully!',
    };
  }

  //Delete Comment
  async deleteComment(id: string, user: User) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid comment ID');
    }

    //Achar o comment
    const comment = await this.commentModel.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const isOwner = user._id.toString() === comment.author.toString();
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only delete your own comment');
    }

    await this.commentModel.findByIdAndDelete(id);

    return {
      message: 'Comment deleted successfully!',
    };
  }
}
