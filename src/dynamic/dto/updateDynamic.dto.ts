import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsEmail, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateIf, ValidateNested } from "class-validator";

export class UpdateImagesDto {
    @IsArray()
    @IsOptional()
    image?: string[];

    @IsString()
    @IsOptional()
    mainPicture?: string;

    @IsString()
    @IsOptional()
    coverPicture?: string;

    @IsArray()
    @IsOptional()
    remove?: string[];
}

export class UpdateFqaDto {

    @IsOptional()
    @IsMongoId()
    id: string;

    @IsNotEmpty()
    @IsString()
    title: string;


    @IsNotEmpty()
    @IsString()
    description: string;
}

export class updateDynamicDto {

    @IsOptional()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    magasine: string;

    @IsOptional()
    @IsString()
    phone: string;

    @IsOptional()
    @IsArray()
    removeFqa?: string[];

    @ValidateIf((obj) => obj.variants !== undefined && obj.variants !== null)
    @IsOptional()
    @IsArray()
    @ArrayMinSize(1, { message: 'At least one variant is required' })
    @ValidateNested({ each: true })
    // @Transform(({ value }) => Array(value))
    @Type(() => UpdateFqaDto)
    fqa?: UpdateFqaDto[];
}