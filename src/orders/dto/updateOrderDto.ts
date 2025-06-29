import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { Statue } from "src/schemas/orderInfo.shema";

export class updateOrderDto {

    @IsEnum(Object.values(Statue), {
        message: 'Valid Statue required'
    })
    status: string;

    @IsOptional()
    @IsNotEmpty()
    tracking: string;
}