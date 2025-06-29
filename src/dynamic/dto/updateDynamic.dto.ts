import { IsArray, IsOptional } from "class-validator";

export class UpdateImagesDto {

    @IsArray()
    @IsOptional()
    image?: string[];

    @IsArray()
    @IsOptional()
    remove?: string[];
}