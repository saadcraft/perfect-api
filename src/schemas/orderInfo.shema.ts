import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum Statue {
    PANDING = 'En attente',
    ACCEPTED = 'Accepté',
    CANCELED = 'Annulé',
    INWAY = 'En route',
    DELIVRED = 'Livré',
    RETURNED = 'Retour'
}

@Schema({
    timestamps: true,
})
export class OrderInformation extends Document {
    @Prop({ required: true })
    fullname: string;

    @Prop({ required: true })
    phoneNumber: string;

    @Prop({ required: true })
    wilaya: string;

    @Prop({ required: true })
    adresse: string;

    @Prop({ required: false })
    email: string;

    @Prop({ default: "En attente" })
    status: Statue;

    @Prop({ required: false })
    tracking: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: "Orders" }] })
    orders: Types.ObjectId[];

    @Prop({ type: Types.ObjectId, ref: "Users", required: false })
    user: Types.ObjectId;
}

export const OrderInfoSchema = SchemaFactory.createForClass(OrderInformation);