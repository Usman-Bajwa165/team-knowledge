// backend/src/knowledge/dto/update-comment.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  content?: string;
}
