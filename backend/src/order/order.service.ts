import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateOrderDto,
  OrderResponseDto,
  OrderTicketResponseDto,
} from './dto/order.dto';
import { FilmsRepositoryInterface } from '../repository/films.repository.interface';

@Injectable()
export class OrderService {
  constructor(
    @Inject('FILMS_REPOSITORY')
    private readonly filmsRepository: FilmsRepositoryInterface,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const { email, phone, tickets } = createOrderDto;

    if (!email || !email.includes('@')) {
      throw new HttpException(
        'Valid email is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!phone || phone.trim().length < 10) {
      throw new HttpException(
        'Valid phone number is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!tickets || tickets.length === 0) {
      throw new HttpException(
        'At least one ticket is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const ticketsBySession = new Map<string, typeof tickets>();
    for (const ticket of tickets) {
      const sessionId = ticket.session;
      if (!ticketsBySession.has(sessionId)) {
        ticketsBySession.set(sessionId, []);
      }
      ticketsBySession.get(sessionId).push(ticket);
    }

    const processedTickets: OrderTicketResponseDto[] = [];

    for (const [sessionId, sessionTickets] of ticketsBySession.entries()) {
      const sessionInfo = await this.filmsRepository.getSessionById(sessionId);

      if (!sessionInfo) {
        throw new HttpException(
          `Session ${sessionId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const { session } = sessionInfo;

      for (const ticket of sessionTickets) {
        if (ticket.price !== session.price) {
          throw new HttpException(
            `Price mismatch for session ${sessionId}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      for (const ticket of sessionTickets) {
        if (ticket.row < 1 || ticket.row > session.rows) {
          throw new HttpException(
            `Row ${ticket.row} is invalid for session ${sessionId}`,
            HttpStatus.BAD_REQUEST,
          );
        }

        if (ticket.seat < 1 || ticket.seat > session.seats) {
          throw new HttpException(
            `Seat ${ticket.seat} is invalid for session ${sessionId}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const takenSet = new Set(session.taken || []);
      for (const ticket of sessionTickets) {
        const seatKey = `${ticket.row}:${ticket.seat}`;
        if (takenSet.has(seatKey)) {
          throw new HttpException(
            `Seat ${ticket.row}:${ticket.seat} is already taken`,
            HttpStatus.CONFLICT,
          );
        }
      }

      for (const ticket of sessionTickets) {
        takenSet.add(`${ticket.row}:${ticket.seat}`);
      }

      await this.filmsRepository.updateTakenSeats(
        sessionId,
        Array.from(takenSet),
      );

      for (const ticket of sessionTickets) {
        processedTickets.push({ ...ticket, id: uuidv4() });
      }
    }

    return {
      total: processedTickets.length,
      items: processedTickets,
    };
  }
}
