import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

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

    @Transform(({ value }) => value === 'true' || value === true)
    @IsOptional()
    @IsBoolean()
    available?: boolean;

    @IsOptional()
    @IsNumber()
    lowPrice?: number;

    @IsOptional()
    images?: string[]

    @IsOptional()
    primaryImage?: string
}