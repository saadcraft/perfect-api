import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export enum Category{
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
  export class Products {
    @Prop()
    title: string;
  
    @Prop()
    description: string;
  
    @Prop()
    Quntity: string;
  
    @Prop()
    price: number;
  
    @Prop()
    category: Category;
  }

  export const ProductSchema = SchemaFactory.createForClass(Products);