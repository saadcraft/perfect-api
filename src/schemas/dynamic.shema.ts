import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Dynamic extends Document {
    @Prop({ required: true })
    magasine: string;

    @Prop({ required: true })
    phone: string;

    @Prop({ required: true })
    email: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: "Fqa" }] })
    fqa: Types.ObjectId[];

    @Prop({ type: Types.ObjectId, ref: "HeroPictures" })
    heroPictures: Types.ObjectId;
}

export const DynamicSchema = SchemaFactory.createForClass(Dynamic);

