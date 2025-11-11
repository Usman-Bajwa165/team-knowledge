// backend/src/knowledge/knowledge.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import type { Request } from 'express';

interface JwtUser {
  id: number;
  email?: string;
  role?: string;
}

@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledge: KnowledgeService) {}

  // PUBLIC
  @Get('articles')
  async getArticles() {
    return this.knowledge.getArticles();
  }

  @Get('articles/:id')
  async getArticle(@Param('id', ParseIntPipe) id: number) {
    return this.knowledge.getArticleById(id);
  }

  @Get('articles/:articleId/comments')
  async getComments(@Param('articleId', ParseIntPipe) articleId: number) {
    return this.knowledge.getCommentsByArticle(articleId);
  }

  // PROTECTED - article creation and modification
  @UseGuards(JwtAuthGuard)
  @Post('articles')
  async createArticle(@Req() req: Request, @Body() dto: CreateArticleDto) {
    const user = req.user as JwtUser;
    return this.knowledge.createArticle(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('articles/:id')
  async updateArticle(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArticleDto,
  ) {
    const user = req.user as JwtUser;
    return this.knowledge.updateArticle(
      { id: user.id, role: user.role },
      id,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('articles/:id')
  async deleteArticle(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const user = req.user as JwtUser;
    return this.knowledge.deleteArticle({ id: user.id, role: user.role }, id);
  }

  // PROTECTED - comments
  @UseGuards(JwtAuthGuard)
  @Post('comments')
  async createComment(@Req() req: Request, @Body() dto: CreateCommentDto) {
    const user = req.user as JwtUser;
    return this.knowledge.createComment({ id: user.id, role: user.role }, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('comments/:id')
  async updateComment(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentDto,
  ) {
    const user = req.user as JwtUser;
    return this.knowledge.updateComment(
      { id: user.id, role: user.role },
      id,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comments/:id')
  async deleteComment(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const user = req.user as JwtUser;
    return this.knowledge.deleteComment({ id: user.id, role: user.role }, id);
  }
}
