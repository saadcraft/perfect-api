import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";

export class CreatWilayaDto {

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    prix_domicile: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    prix_sd: number;
}