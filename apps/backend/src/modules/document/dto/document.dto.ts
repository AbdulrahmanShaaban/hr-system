import { IsString, IsOptional } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  title!: string;

  @IsString()
  fileUrl!: string;

  @IsString()
  mimeType!: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
