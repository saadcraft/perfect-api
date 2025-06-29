import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Wilayas, WilayaShema } from 'src/schemas/wilayas.shema';
import { UsersModule } from 'src/users/users.module';
import { WilayaController } from './wilaya.controller';
import { WilayaService } from './wilaya.service';

@Module({
    imports: [MongooseModule.forFeature([
        { name: Wilayas.name, schema: WilayaShema },
    ]), UsersModule],
    controllers: [WilayaController],
    providers: [WilayaService]
})
export class WilayaModule { }
