import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";



@Schema()
export class Variants extends Document {

    @Prop({ required: false })
    color: string;

    @Prop({ required: false })
    resolution: string;

    @Prop({ required: false })
    reference: string;

    @Prop({ required: false })
    quntity: number;

    @Prop({ required: true })
    price: number;

}

export const VariantsSchema = SchemaFactory.createForClass(Variants);