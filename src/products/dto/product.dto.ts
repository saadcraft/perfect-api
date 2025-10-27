import { Transform, Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsEnum, IsMongoId, isNotEmpty, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";
// import { AtLeastOneNotEmpty } from "src/config/at-least-one-not-empty.decorator";

export class VariantsDto {

    @IsMongoId()
    id: string;

    @IsOptional()
    sku?: string;

    // // 👇 Validate that at least one of the fields is not empty
    // @AtLeastOneNotEmpty(['color', 'resolution', 'reference'])
    // dummy?: never; // Still needed, but more semantic

    @IsOptional()
    @IsObject()
    options: Record<string, string[]>;

    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    quntity?: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    price: number;
}

export class CategoryDto {

    @IsString()
    categorie: string;

    @IsString()
    name: string;
}

export class CreateProductDto {
    @IsString()
    @IsNotEmpty({ message: "le titre ne doit pas être vide" })
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsMongoId()
    category: string;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    lowPrice: number;

    @IsArray()
    @IsOptional() // Images may be optional initially before upload
    images?: string[];

    @IsNotEmpty({ message: "select primary image" })
    primaryImage?: string; // Store primary image path

    @IsObject()
    attributes: Record<string, string[]>; // {"color": ["red", "blue"], "size": ["M", "L"]}

    @IsOptional()
    @IsArray()
    @ArrayMinSize(1, { message: 'At least one variant is required' })
    @ValidateNested({ each: true })
    // @Transform(({ value }) => Array(value))
    @Type(() => VariantsDto)
    variants: VariantsDto[];
}