import { Module } from '@nestjs/common';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { DatabaseModule } from '../database/database.module';
import { PostgresFilmsRepository } from '../repository/postgres-films.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [FilmsController],
  providers: [
    FilmsService,
    {
      provide: 'FILMS_REPOSITORY',
      useClass: PostgresFilmsRepository,
    },
  ],
  exports: [FilmsService, 'FILMS_REPOSITORY'],
})
export class FilmsModule {}
