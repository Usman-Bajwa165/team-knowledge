// backend/src/knowledge/dto/update-article.dto.ts
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateArticleDto {
  @IsOptional()
  @IsString()
  @MaxLength(250)
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;
}
