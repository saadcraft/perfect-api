import { Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

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
    @IsNumber()
    quntity: number;
}