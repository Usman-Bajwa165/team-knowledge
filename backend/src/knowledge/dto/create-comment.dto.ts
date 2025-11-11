// backend/src/knowledge/dto/create-comment.dto.ts
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCommentDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  articleId!: number;

  @IsString()
  @IsNotEmpty()
  content!: string;
}
