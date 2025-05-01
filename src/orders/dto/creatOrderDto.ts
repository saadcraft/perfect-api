import { Transform, Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";


export class OrderDto {

    @IsMongoId()
    variantId: string;

    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    quantity?: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    price: number;
}

export class orderInfoDto {
    @IsString()
    @IsNotEmpty({ message: "le Nom et Prénom ne doit pas être vide" })
    fullname: string;

    @IsString()
    @IsNotEmpty({ message: "le Numéro ne doit pas être vide" })
    phoneNumber: string;

    @IsString()
    @IsNotEmpty({ message: "la Wilaya ne doit pas être vide" })
    wilaya: string;

    @IsString()
    @IsNotEmpty({ message: "l'adresse ne doit pas être vide" })
    adresse: string;

    @IsOptional()
    @IsMongoId()
    user: string;

    @IsArray()
    @ArrayMinSize(1, { message: 'At least one order is required' })
    @ValidateNested({ each: true })
    // @Transform(({ value }) => Array(value))
    @Type(() => OrderDto)
    orders: OrderDto[];
}