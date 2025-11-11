// backend/src/knowledge/dto/create-article.dto.ts
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;
}
