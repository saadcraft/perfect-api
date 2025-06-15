import { Type } from "class-transformer";
import { IsArray, IsEmail, IsNotEmpty, IsString, ValidateNested } from "class-validator";

export class FqaDto {
    @IsNotEmpty()
    @IsString()
    title: string;


    @IsNotEmpty()
    @IsString()
    description: string;
}


export class DynamicDto {
    @IsNotEmpty()
    @IsString()
    magasine: string;

    @IsNotEmpty()
    @IsString()
    phone: string;

    @IsNotEmpty()
    @IsEmail({}, { message: "Email dosn't much" })
    email: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FqaDto)
    fqa: FqaDto[];

}