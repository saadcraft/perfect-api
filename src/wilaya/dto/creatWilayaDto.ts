import { Transform, Type } from "class-transformer";
import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";

// export class CreateWilayasDto {
//     @IsArray()
//     @ValidateNested({ each: true })
//     @Type(() => WilayaDto)
//     wilayas: WilayaDto[];
// }

// export class WilayaDto {

//     @IsString()
//     @IsNotEmpty()
//     name_recieve: string;

//     @Transform(({ value }) => Number(value))
//     @IsNumber()
//     @IsNotEmpty()
//     code_recieve: number;

//     @Transform(({ value }) => Number(value))
//     @IsNumber()
//     @IsNotEmpty()
//     prix_sd: number;

//     @Transform(({ value }) => Number(value))
//     @IsNumber()
//     @IsNotEmpty()
//     prix_domicile: number;

// }

export class CreateCityDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    code: number;

    @IsString()
    @IsNotEmpty()
    code_city: string;

}

export class CreatCommonDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    code: number;

    @IsString()
    @IsNotEmpty()
    code_common: string;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    price_delivry: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    additional_price: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    additional_distance: number;

    @IsMongoId()
    @IsNotEmpty()
    city: string;
}