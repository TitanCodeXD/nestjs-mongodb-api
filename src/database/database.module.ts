//Criar modulos do NestJS
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Mongoose
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot(),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      // Factory responsável por montar as configurações que serão utilizadas pelo Mongoose.
      //Variável de conexão com MongoDB
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),

        // Executado quando a conexão com o Mongoose é criada.para ter aquela REAL certeza da conexão com o banco realmente ter sido realizada com sucesso!
        onConnectionCreate: (connection) => {
          console.log('🍃 MongoDB connected successfully');

          connection.on('error', (error) => {
            console.error('❌ MongoDB connection error:', error);
          });

          return connection;
        },
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class DatabaseModule {}
