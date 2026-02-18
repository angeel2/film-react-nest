import { Module } from '@nestjs/common';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { MemoryFilmsRepository } from '../repository/memory-films.repository';

@Module({
  imports: [],
  controllers: [FilmsController],
  providers: [
    FilmsService,
    {
      provide: 'FILMS_REPOSITORY',
      useClass: MemoryFilmsRepository,
    },
  ],
  exports: [FilmsService, 'FILMS_REPOSITORY'],
})
export class FilmsModule {}
