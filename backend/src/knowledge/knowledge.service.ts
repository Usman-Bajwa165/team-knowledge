// backend/src/knowledge/knowledge.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class KnowledgeService {
  constructor(private readonly prisma: PrismaService) {}

  // Articles
  async createArticle(userId: number, dto: CreateArticleDto) {
    const article = await this.prisma.knowledgeArticle.create({
      data: {
        title: dto.title,
        content: dto.content,
        authorId: userId,
      },
      include: { author: true, comments: true },
    });
    return article;
  }

  async getArticles() {
    // return recent articles with count of comments and author basic info
    return this.prisma.knowledgeArticle.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, email: true, name: true } },
        comments: { select: { id: true } },
      },
    });
  }

  async getArticleById(id: number) {
    const article = await this.prisma.knowledgeArticle.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, email: true, name: true } },
        comments: {
          include: {
            author: { select: { id: true, email: true, name: true } },
          },
        },
      },
    });
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  // updateArticle
  async updateArticle(
    user: { id: number; role?: string },
    id: number,
    dto: UpdateArticleDto,
  ) {
    const article = await this.prisma.knowledgeArticle.findUnique({
      where: { id },
    });
    if (!article) throw new NotFoundException('Article not found');

    const isOwner = article.authorId === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) throw new ForbiddenException('Not allowed');

    const updated = await this.prisma.knowledgeArticle.update({
      where: { id },
      data: { ...dto },
      include: { comments: true }, // include as needed
    });
    return updated;
  }

  // deleteArticle
  async deleteArticle(user: { id: number; role?: string }, id: number) {
    // ensure article exists
    const article = await this.prisma.knowledgeArticle.findUnique({
      where: { id },
    });
    if (!article) throw new NotFoundException('Article not found');

    // only author or admin can delete
    if (article.authorId !== user.id && user.role !== 'admin')
      throw new ForbiddenException('Not allowed');

    try {
      // delete comments for this article then delete the article (atomic)
      await this.prisma.$transaction([
        this.prisma.knowledgeComment.deleteMany({ where: { articleId: id } }),
        this.prisma.knowledgeArticle.delete({ where: { id } }),
      ]);

      return { ok: true };
    } catch (err) {
      // log for debugging, then throw a generic not-too-verbose error
      console.error('Failed to delete article cascade:', err);
      throw new ForbiddenException('Failed to delete article.');
    }
  }

  // createComment (no change needed except signature might take user object)
  async createComment(
    user: { id: number; role?: string },
    dto: CreateCommentDto,
  ) {
    const article = await this.prisma.knowledgeArticle.findUnique({
      where: { id: dto.articleId },
    });
    if (!article) throw new NotFoundException('Article not found');

    const comment = await this.prisma.knowledgeComment.create({
      data: {
        content: dto.content,
        articleId: dto.articleId,
        authorId: user.id,
      },
      include: { author: true },
    });
    return comment;
  }

  async getCommentsByArticle(articleId: number) {
    return this.prisma.knowledgeComment.findMany({
      where: { articleId },
      include: { author: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  // updateComment
  async updateComment(
    user: { id: number; role?: string },
    id: number,
    dto: UpdateCommentDto,
  ) {
    const comment = await this.prisma.knowledgeComment.findUnique({
      where: { id },
    });
    if (!comment) throw new NotFoundException('Comment not found');

    const isAuthor = comment.authorId === user.id;
    const article = await this.prisma.knowledgeArticle.findUnique({
      where: { id: comment.articleId },
    });
    const isArticleAuthor = article?.authorId === user.id;
    const isAdmin = user.role === 'admin';

    if (!isAuthor && !isArticleAuthor && !isAdmin)
      throw new ForbiddenException('Not allowed');

    const updated = await this.prisma.knowledgeComment.update({
      where: { id },
      data: dto,
      include: { author: true },
    });
    return updated;
  }

  // deleteComment
  async deleteComment(user: { id: number; role?: string }, id: number) {
    const comment = await this.prisma.knowledgeComment.findUnique({
      where: { id },
    });
    if (!comment) throw new NotFoundException('Comment not found');

    const isAuthor = comment.authorId === user.id;
    const article = await this.prisma.knowledgeArticle.findUnique({
      where: { id: comment.articleId },
    });
    const isArticleAuthor = article?.authorId === user.id;
    const isAdmin = user.role === 'admin';

    if (!isAuthor && !isArticleAuthor && !isAdmin)
      throw new ForbiddenException('Not allowed');

    await this.prisma.knowledgeComment.delete({ where: { id } });
    return { ok: true };
  }
}
