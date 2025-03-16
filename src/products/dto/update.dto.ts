import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsEnum(['foods', 'fétes', 'médical', 'beauty', 'sport', 'gaming'], {
        message: 'Valid category required'
    })
    @IsOptional()
    category?: string;

    @IsOptional()
    @IsNumber()
    price?: number;

    @IsOptional()
    images?: string[]
}