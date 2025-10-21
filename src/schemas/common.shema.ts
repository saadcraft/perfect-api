import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema()
export class Common extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    code: number;

    @Prop({ required: true, unique: true })
    code_common: string;

    @Prop({ required: true })
    price_delivry: number;

    @Prop({ required: true })
    additional_price: number;

    @Prop({ required: true })
    additional_distance: number;

    @Prop({ required: true, default: 0 })
    count: number;

    @Prop({ required: false, type: [{ type: Types.ObjectId, ref: "Tarif" }] })
    price_between_cities: Types.ObjectId[];

    @Prop({ required: true, type: Types.ObjectId, ref: "Cities" })
    city: Types.ObjectId;

    @Prop({ default: true })
    available: boolean;
}

export const CommonSchema = SchemaFactory.createForClass(Common);