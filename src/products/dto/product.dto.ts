import { Transform } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductDto {
    @IsString()
    @IsNotEmpty({ message: "le titre ne doit pas être vide" })
    title: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsEnum(['foods', 'fétes', 'médical', 'beauty', 'sport', 'gaming'], {
        message: 'Valid category required'
    })
    category: string;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    price: number;

    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    quntity: number;

    @IsArray()
    @IsOptional() // Images may be optional initially before upload
    images?: string[];

    @IsString()
    @IsOptional()
    primaryImage?: string; // Store primary image path
}