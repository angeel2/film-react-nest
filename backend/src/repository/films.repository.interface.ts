import { FilmDto } from '../films/dto/films.dto';
import { ScheduleDto } from '../films/dto/schedule.dto';

export interface FilmsRepositoryInterface {
  findAll(): Promise<FilmDto[]>;
  findById(id: string): Promise<FilmDto | null>;
  getFilmSchedule(filmId: string): Promise<ScheduleDto[]>;
  updateTakenSeats(sessionId: string, takenSeats: string[]): Promise<boolean>;
  getSessionById(
    sessionId: string,
  ): Promise<{ filmId: string; session: ScheduleDto } | null>;
}
