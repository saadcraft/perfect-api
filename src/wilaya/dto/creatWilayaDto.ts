import { Transform, Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";

export class CreateWilayasDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WilayaDto)
    wilayas: WilayaDto[];
}

export class WilayaDto {

    @IsString()
    @IsNotEmpty()
    name_recieve: string;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    code_recieve: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    prix_sd: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    prix_domicile: number;

}