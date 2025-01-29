import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsEnum(['foods','fétes','médical','beauty','sport','gaming'], {
        message: 'Valid category required'
    })
    category: string;

    @IsNumber()
    price: number;
}