import { IsEnum, IsNumber, IsString } from "class-validator";

export class CreateProductDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsEnum(['foods','fétes','médical','beauty','sport','gaming'], {
        message: 'Valid category required'
    })
    category: string;

    @IsNumber()
    price: number;
}