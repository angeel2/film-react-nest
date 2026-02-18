import { Injectable, Inject } from '@nestjs/common';
import { FilmDto } from './dto/films.dto';
import { ScheduleDto } from './dto/schedule.dto';
import { FilmsRepositoryInterface } from '../repository/films.repository.interface';

@Injectable()
export class FilmsService {
  constructor(
    @Inject('FILMS_REPOSITORY')
    private readonly filmsRepository: FilmsRepositoryInterface,
  ) {}

  async findAll(): Promise<FilmDto[]> {
    return this.filmsRepository.findAll();
  }

  async findById(id: string): Promise<FilmDto | null> {
    return this.filmsRepository.findById(id);
  }

  async getFilmSchedule(filmId: string): Promise<ScheduleDto[]> {
    return this.filmsRepository.getFilmSchedule(filmId);
  }

  async updateTakenSeats(
    sessionId: string,
    takenSeats: string[],
  ): Promise<boolean> {
    return this.filmsRepository.updateTakenSeats(sessionId, takenSeats);
  }
}
