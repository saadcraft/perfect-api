import { Transform, Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf, ValidateNested } from "class-validator";
import { VariantsDto } from "./product.dto";
// import { VariantsDto } from "./product.dto";
// import { AtLeastOneNotEmpty } from "src/config/at-least-one-not-empty.decorator";

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
    images?: string[];

    @IsOptional()
    newPrimaryImage?: string;

    @IsOptional()
    oldPrimaryImage?: string;

    @IsOptional()
    primaryImage?: string;

    @IsOptional()
    @IsArray()
    removeImage?: string[];

    // @IsOptional()
    // @IsArray()
    // removeVariant?: string[];

    // @ValidateIf((obj) => obj.variants !== undefined && obj.variants !== null)
    // @IsOptional()
    // @IsArray()
    // @ArrayMinSize(1, { message: 'At least one variant is required' })
    // @ValidateNested({ each: true })
    // // @Transform(({ value }) => Array(value))
    // @Type(() => VariantsDto)
    // variants?: VariantsDto[];
}


export class VariantUpdateDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VariantsDto)
    updates: VariantsDto[];
}