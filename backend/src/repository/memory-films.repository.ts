import { Injectable } from '@nestjs/common';
import { FilmDto } from '../films/dto/films.dto';
import { ScheduleDto } from '../films/dto/schedule.dto';
import { FilmsRepositoryInterface } from './films.repository.interface';
import testData from '../../test/mongodb_initial_stub.json';

@Injectable()
export class MemoryFilmsRepository implements FilmsRepositoryInterface {
  private films: FilmDto[];

  constructor() {
    this.films = testData.map((item) => ({
      id: item.id,
      rating: item.rating,
      director: item.director,
      tags: item.tags,
      title: item.title,
      about: item.about,
      description: item.description,
      image: item.image,
      cover: item.cover,
      schedule: item.schedule || [],
    }));
  }

  async findAll(): Promise<FilmDto[]> {
    return this.films.map((film) => ({
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: film.tags,
      title: film.title,
      about: film.about,
      description: film.description,
      image: film.image,
      cover: film.cover,
    }));
  }

  async findById(id: string): Promise<FilmDto | null> {
    const film = this.films.find((f) => f.id === id);
    return film ? { ...film, schedule: film.schedule || [] } : null;
  }

  async getFilmSchedule(filmId: string): Promise<ScheduleDto[]> {
    const film = this.films.find((f) => f.id === filmId);
    return film?.schedule || [];
  }

  async updateTakenSeats(
    sessionId: string,
    takenSeats: string[],
  ): Promise<boolean> {
    for (const film of this.films) {
      if (film.schedule) {
        const sessionIndex = film.schedule.findIndex((s) => s.id === sessionId);
        if (sessionIndex !== -1) {
          film.schedule[sessionIndex].taken = takenSeats;
          return true;
        }
      }
    }
    return false;
  }

  async getSessionById(
    sessionId: string,
  ): Promise<{ filmId: string; session: ScheduleDto } | null> {
    for (const film of this.films) {
      if (film.schedule) {
        const session = film.schedule.find((s) => s.id === sessionId);
        if (session) {
          return { filmId: film.id, session };
        }
      }
    }
    return null;
  }
}
