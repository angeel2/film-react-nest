import { ScheduleDto } from './schedule.dto';

export class FilmDto {
  id: string;
  rating: number;
  director: string;
  tags: string[];
  title: string;
  about: string;
  description: string;
  image: string;
  cover: string;
  schedule?: ScheduleDto[];
}

export class FilmsResponseDto {
  total: number;
  items: FilmDto[];
}
