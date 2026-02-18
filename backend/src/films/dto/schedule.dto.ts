export class ScheduleDto {
  id: string;
  daytime: string;
  hall: number;
  rows: number;
  seats: number;
  price: number;
  taken: string[];
}

export class ScheduleResponseDto {
  total: number;
  items: ScheduleDto[];
}
