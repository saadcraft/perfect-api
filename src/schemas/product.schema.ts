import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum Category {
  FOODS = 'foods',
  FETES = 'fétes',
  MEDICAL = 'médical',
  BEAUTY = 'beauty',
  SPORT = 'sport',
  GAMING = 'gaming'
}

@Schema({
  timestamps: true,
})
export class Products extends Document {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  quntity: number;

  @Prop()
  price: number;

  @Prop()
  category: Category;

  @Prop({ type: [String] }) // Array of image filenames
  images: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Products);