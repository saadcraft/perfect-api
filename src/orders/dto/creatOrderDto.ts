import { Transform, Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsEmail, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { AtLeastOneNotEmpty } from "src/config/at-least-one-not-empty.decorator";


export class PersonalizerDto {
    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    height: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    Width: number;

    @IsString()
    @IsNotEmpty({ message: "le Font ne doit pas être vide" })
    font: string;

    @IsString()
    @IsNotEmpty({ message: "le Text ne doit pas être vide" })
    text: string;

    @IsString()
    @IsNotEmpty({ message: "la color ne doit pas être vide" })
    color: string;

    @IsString()
    @IsNotEmpty({ message: "le materiel ne doit pas être vide" })
    materiel: string;
}

export class OrderDto {

    @IsMongoId()
    @IsOptional()
    variant?: string;

    @ValidateNested({ each: true })
    // @Transform(({ value }) => Array(value))
    @Type(() => PersonalizerDto)
    @IsOptional()
    parsonalizer?: PersonalizerDto;

    // 👇 Validate that at least one of the fields is not empty
    @AtLeastOneNotEmpty(['variant', 'parsonalizer'])
    dummy?: never; // Still needed, but more semantic

    @Transform(({ value }) => Number(value))
    @IsNumber()
    quantity: number;

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
    @IsEmail()
    email: string;

    @IsOptional()
    @IsMongoId()
    user: string;

    @IsArray()
    @ArrayMinSize(1, { message: 'At least one order is required' })
    @ValidateNested({ each: true })
    // @Transform(({ value }) => Array(value))
    @Type(() => OrderDto)
    orders: OrderDto[];

    @IsMongoId()
    @IsNotEmpty()
    dynamic: string;
}