import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";



@Schema()
export class Variants extends Document {

    @Prop({ required: true })
    sku: string;

    @Prop({ type: Types.ObjectId, ref: 'Product' })
    product: Types.ObjectId;

    @Prop({ type: Map, of: String })
    options: Map<string, string>;

    @Prop({ required: false })
    quntity: number;

    @Prop({ required: true })
    price: number;

}

export const VariantsSchema = SchemaFactory.createForClass(Variants);