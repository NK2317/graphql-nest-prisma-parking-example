/* eslint-disable prettier/prettier */
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ParkingService } from './parking.service';
import { CreateParkingInput } from './dto/create-parking.input';
import { UserType } from '@prisma/client';
import { OrderParkingBy } from './types';
import { RulesService } from './rules.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/auth.guard';

@Resolver('Parking')
export class ParkingResolver {
  constructor(private readonly parkingService: ParkingService, private readonly rulesService: RulesService) { }

  @UseGuards(GqlAuthGuard)
  @Mutation('createParking')
  async create(@Args('createParkingInput') createParkingInput: CreateParkingInput) {
    await this.rulesService.validParkingInput(createParkingInput);
    const createdParking = await this.parkingService.create(createParkingInput);
    return createdParking;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation('checkin')
  async checkin(@Args('parkingId') parkingId: number, @Args('userType') userType: UserType) {
    const foundParking = await this.parkingService.findById(parkingId);
    await this.rulesService.checkParkingCapacity(foundParking);
    await this.rulesService.userIsAllowedOnParking(userType, foundParking);
    return this.parkingService.checkin(parkingId, userType);
  }

  @UseGuards(GqlAuthGuard)
  @Query('parkings')
  findAll(@Args('skip') skip: number, @Args("take") take: number, @Args("orderBy") orderBy: OrderParkingBy) {
    return this.parkingService.findAll(skip, take, orderBy);
  }

  @Query('getToken')
  getToken(@Args('userName') userName: string) {
    return this.parkingService.getToken(userName);
  }
}
