import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilmEntity } from '../films/entities/film.entity';
import { ScheduleEntity } from '../films/entities/schedule.entity';
import { FilmDto } from '../films/dto/films.dto';
import { ScheduleDto } from '../films/dto/schedule.dto';
import { FilmsRepositoryInterface } from './films.repository.interface';

@Injectable()
export class PostgresFilmsRepository implements FilmsRepositoryInterface {
  constructor(
    @InjectRepository(FilmEntity)
    private filmRepository: Repository<FilmEntity>,
  ) {}

  private toFilmDto(film: FilmEntity): FilmDto {
    return {
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: film.tags,
      title: film.title,
      about: film.about,
      description: film.description,
      image: film.image,
      cover: film.cover,
    };
  }

  private toFilmWithScheduleDto(film: FilmEntity): FilmDto {
    return {
      ...this.toFilmDto(film),
      schedule: film.schedule?.map((s) => this.toScheduleDto(s)),
    };
  }

  private toScheduleDto(schedule: ScheduleEntity): ScheduleDto {
    return {
      id: schedule.id,
      daytime: schedule.daytime,
      hall: schedule.hall,
      rows: schedule.rows,
      seats: schedule.seats,
      price: schedule.price,
      taken: schedule.taken || [],
    };
  }

  async findAll(): Promise<FilmDto[]> {
    const films = await this.filmRepository.find();
    return films.map((film) => this.toFilmDto(film));
  }

  async findById(id: string): Promise<FilmDto | null> {
    const film = await this.filmRepository.findOne({
      where: { id },
      relations: ['schedule'],
    });
    return film ? this.toFilmWithScheduleDto(film) : null;
  }

  async getFilmSchedule(filmId: string): Promise<ScheduleDto[]> {
    const film = await this.filmRepository.findOne({
      where: { id: filmId },
      relations: ['schedule'],
    });
    return film?.schedule?.map((s) => this.toScheduleDto(s)) || [];
  }

  async updateTakenSeats(
    sessionId: string,
    takenSeats: string[],
  ): Promise<boolean> {
    const result = await this.filmRepository.manager
      .createQueryBuilder()
      .update(ScheduleEntity)
      .set({ taken: takenSeats })
      .where('id = :id', { id: sessionId })
      .execute();

    return result.affected > 0;
  }

  async getSessionById(
    sessionId: string,
  ): Promise<{ filmId: string; session: ScheduleDto } | null> {
    const schedule = await this.filmRepository.manager
      .createQueryBuilder(ScheduleEntity, 'schedule')
      .where('schedule.id = :id', { id: sessionId })
      .getOne();

    if (!schedule) return null;

    return {
      filmId: schedule.filmId,
      session: this.toScheduleDto(schedule),
    };
  }
}
