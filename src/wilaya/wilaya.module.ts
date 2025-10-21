import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tarif, TarifShema } from 'src/schemas/tarife.shema';
import { UsersModule } from 'src/users/users.module';
import { WilayaController } from './wilaya.controller';
import { WilayaService } from './wilaya.service';
import { Cities, CitySchema } from 'src/schemas/cities.shema';
import { Common, CommonSchema } from 'src/schemas/common.shema';

@Module({
    imports: [MongooseModule.forFeature([
        { name: Tarif.name, schema: TarifShema },
        { name: Cities.name, schema: CitySchema },
        { name: Common.name, schema: CommonSchema }
    ]), UsersModule],
    controllers: [WilayaController],
    providers: [WilayaService]
})
export class WilayaModule { }
