import { Transform, Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";
// import { AtLeastOneNotEmpty } from "src/config/at-least-one-not-empty.decorator";

export class VariantsDto {

    @IsOptional()
    _id?: string;

    @IsOptional()
    sku?: string;

    // @IsString()
    // @IsOptional()
    // color: string;

    // @IsString()
    // @IsOptional()
    // resolution: string;

    // @IsString()
    // @IsOptional()
    // reference: string;

    // // 👇 Validate that at least one of the fields is not empty
    // @AtLeastOneNotEmpty(['color', 'resolution', 'reference'])
    // dummy?: never; // Still needed, but more semantic

    @IsNotEmpty()
    @IsObject()
    options: Record<string, string[]>;

    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    quntity: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    price: number;

}

export class CreateProductDto {
    @IsString()
    @IsNotEmpty({ message: "le titre ne doit pas être vide" })
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(['foods', 'fétes', 'médical', 'beauty', 'sport', 'gaming'], {
        message: 'Valid category required'
    })
    category: string;

    @IsNumber()
    @IsOptional()
    lowPrice?: number;

    @IsArray()
    @IsOptional() // Images may be optional initially before upload
    images?: string[];

    @IsNotEmpty()
    primaryImage?: string; // Store primary image path

    @IsObject()
    attributes: Record<string, string[]>; // {"color": ["red", "blue"], "size": ["M", "L"]}

    @IsArray()
    @ArrayMinSize(1, { message: 'At least one variant is required' })
    @ValidateNested({ each: true })
    // @Transform(({ value }) => Array(value))
    @Type(() => VariantsDto)
    variants: VariantsDto[];

}