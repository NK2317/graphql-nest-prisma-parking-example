/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Parking, ParkingType, UserType } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParkingInput } from './dto/create-parking.input';
import * as Joi from 'joi';

@Injectable()
export class RulesService {
  constructor(private readonly prismaService: PrismaService) { }

  private ParkingSchema = Joi.object({
    name: Joi.string().required(),
    contact: Joi.string()
      .length(10)
      .pattern(/^[0-9]+$/)
      .required(),
    slots: Joi.number().greater(49).less(1501),
    parkingType: Joi.string().valid('public', 'private', 'courtesy'),
  });

  private isWorkingDay() {
    const today = new Date();
    const currentDay = today.getDay();
    return currentDay <= 5;
  }

  async checkParkingCapacity(parking: Parking) {
    if (parking.slots === 0) {
      throw new GraphQLError(
        'There are no more slots aviable in this parking',
        {
          extensions: {
            code: 'FULL_PARKING_SLOTS',
          },
        },
      );
    }
  }

  async userIsAllowedOnParking(userType: UserType, parking: Parking) {
    const { parkingType } = parking;
    if (parkingType === ParkingType.public) return;
    if (parkingType === ParkingType.private && userType !== UserType.corporate) throw new GraphQLError(
      'You must be a corporate user to join this parking',
      {
        extensions: {
          code: 'USER_NOT_ALLOWED_IN_PARKING',
        },
      },
    );
    if (parkingType === ParkingType.courtesy && !this.isWorkingDay()) throw new GraphQLError(
      'Courtesy parkings are open only in woring days',
      {
        extensions: {
          code: 'COURTESY_PARKING_CLOSED',
        },
      }
    );
    if (parkingType === ParkingType.courtesy && userType !== UserType.visitor) throw new GraphQLError(
      'You must be a visitor user to join this parking',
      {
        extensions: {
          code: 'USER_NOT_ALLOWED_IN_PARKING',
        },
      },
    );
  }

  async validParkingInput(parking: CreateParkingInput) {
    // parking already exists
    const foundParking = await this.prismaService.parking.findFirst({ where: { name: parking.name } });
    if (foundParking) throw new GraphQLError(
      `A parking with name ${parking.name} already exists`,
      {
        extensions: {
          code: 'REPEATED_PARKING_NAME',
        },
      },
    );
    const { error } = this.ParkingSchema.validate(parking);
    if (error) throw new GraphQLError(
      `Invalid request`,
      {
        extensions: {
          code: 'INVALID_REQUEST',
          validationError: error,
        },
      },
    );
  }
}
