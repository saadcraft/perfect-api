import { Module } from '@nestjs/common';
import { DynamicService } from './dynamic.service';
import { DynamicController } from './dynamic.controller';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Dynamic, DynamicSchema } from 'src/schemas/dynamic.shema';
import { Fqa, FqaSchema } from 'src/schemas/fqa.shema';
import { HeroPictures, HeroPicturesSchema } from 'src/schemas/heroPictures.shema';
import { Users, UserSchema } from 'src/schemas/user.schema';
import { Categories, CategoriesSchema } from 'src/schemas/categories.shema';

@Module({
    imports: [MongooseModule.forFeature([
        { name: Dynamic.name, schema: DynamicSchema },
        { name: Fqa.name, schema: FqaSchema },
        { name: HeroPictures.name, schema: HeroPicturesSchema },
        { name: Users.name, schema: UserSchema },
        { name: Categories.name, schema: CategoriesSchema }
    ]), UsersModule],
    controllers: [DynamicController],
    providers: [DynamicService],
})
export class DynamicModule { }
