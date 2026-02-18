import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film } from '../films/schemas/film.schema';
import { FilmDto } from '../films/dto/films.dto';
import { ScheduleDto } from '../films/dto/schedule.dto';
import { FilmsRepositoryInterface } from './films.repository.interface';

@Injectable()
export class MongoDBFilmsRepository implements FilmsRepositoryInterface {
  constructor(@InjectModel(Film.name) private filmModel: Model<Film>) {}

  private toFilmDto(film: Film): FilmDto {
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

  private toFilmWithScheduleDto(film: Film): FilmDto {
    return {
      ...this.toFilmDto(film),
      schedule: film.schedule?.map((item) => ({
        id: item.id,
        daytime: item.daytime,
        hall: item.hall,
        rows: item.rows,
        seats: item.seats,
        price: item.price,
        taken: item.taken || [],
      })),
    };
  }

  async findAll(): Promise<FilmDto[]> {
    const films = await this.filmModel.find().exec();
    return films.map((film) => this.toFilmDto(film));
  }

  async findById(id: string): Promise<FilmDto | null> {
    const film = await this.filmModel.findOne({ id }).exec();
    return film ? this.toFilmWithScheduleDto(film) : null;
  }

  async getFilmSchedule(filmId: string): Promise<ScheduleDto[]> {
    const film = await this.filmModel.findOne({ id: filmId }).exec();
    return (
      film?.schedule?.map((item) => ({
        id: item.id,
        daytime: item.daytime,
        hall: item.hall,
        rows: item.rows,
        seats: item.seats,
        price: item.price,
        taken: item.taken || [],
      })) || []
    );
  }

  async updateTakenSeats(
    sessionId: string,
    takenSeats: string[],
  ): Promise<boolean> {
    const result = await this.filmModel
      .updateOne(
        { 'schedule.id': sessionId },
        { $set: { 'schedule.$.taken': takenSeats } },
      )
      .exec();
    return result.modifiedCount > 0;
  }

  async getSessionById(
    sessionId: string,
  ): Promise<{ filmId: string; session: ScheduleDto } | null> {
    const film = await this.filmModel
      .findOne({ 'schedule.id': sessionId }, { 'schedule.$': 1 })
      .exec();

    if (film?.schedule?.length) {
      const session = film.schedule[0];
      return {
        filmId: film.id,
        session: {
          id: session.id,
          daytime: session.daytime,
          hall: session.hall,
          rows: session.rows,
          seats: session.seats,
          price: session.price,
          taken: session.taken || [],
        },
      };
    }
    return null;
  }
}
