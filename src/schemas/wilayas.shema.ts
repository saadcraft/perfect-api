import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema()
export class Wilayas extends Document {
    @Prop({ default: "Tlemcen" })
    name_send: string;

    @Prop({ default: 13 })
    code_send: number;

    @Prop({ required: true })
    name_recieve: string;

    @Prop({ required: true })
    code_recieve: number;

    @Prop({ required: true })
    prix_sd: number;

    @Prop({ required: true })
    prix_domicile: number;
}

export const WilayaShema = SchemaFactory.createForClass(Wilayas);