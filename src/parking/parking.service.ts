/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParkingInput } from './dto/create-parking.input';
import { OrderParkingBy } from './types';

@Injectable()
export class ParkingService {
  constructor(private readonly prismaService: PrismaService, private readonly jwtService: JwtService) { }
  create(data: CreateParkingInput) {
    return this.prismaService.parking.create({
      data: {
        ...data,
        aviableSlots: data.slots,
      }
    });
  }

  findAll(skip: number, take: number, orderBy: OrderParkingBy) {
    return this.prismaService.parking.findMany({
      skip, take, orderBy: {
        [orderBy.orderBy]: orderBy.direction,
      }
    });
  }

  findById(id: number) {
    return this.prismaService.parking.findUnique({ where: { id } });
  }

  async checkin(parkingId: number, userType: UserType) {
    const newChecking = await this.prismaService.checkin.create({ data: { parkingId, userType } });
    await this.prismaService.parking.update({
      data: {
        aviableSlots: { decrement: 1 },
      },
      where: { id: parkingId },
    });
    return newChecking;
  }

  getToken(userName: string) {
    return this.jwtService.sign({ userName });
  }
}
