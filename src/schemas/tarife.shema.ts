import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema()
export class Tarif extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    code: number;

    @Prop({ required: true })
    prix_sd: number;

    @Prop({ required: true })
    prix_domicile: number;

    @Prop({ type: Types.ObjectId, ref: "Common", requird: true })
    common: Types.ObjectId;
}

export const TarifShema = SchemaFactory.createForClass(Tarif);