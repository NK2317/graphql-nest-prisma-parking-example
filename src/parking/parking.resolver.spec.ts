import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { ParkingType, UserType } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { PrismaService } from '../prisma/prisma.service';
import { ParkingResolver } from './parking.resolver';
import { ParkingService } from './parking.service';
import { RulesService } from './rules.service';

const GET_PARKING_MOCK = (parkingType: ParkingType, aviableSlots: number) => ({
  id: 1,
  name: 'name',
  contact: '3411297865',
  parkingType,
  slots: 50,
  aviableSlots,
  createdAt: new Date(),
});

const GET_CHECKIN_MOCK_VALUE = (
  parkingType: ParkingType,
  userType: UserType,
) => ({
  id: 1,
  parkingId: 1,
  parkingType,
  userType,
  createdAt: new Date(),
});

const getModule = (
  parkingMockValue: any,
  checkinMockValue: any,
  updatedParkingValue: any,
) =>
  Test.createTestingModule({
    providers: [
      ParkingResolver,
      {
        provide: ParkingService,
        useValue: {
          checkin: () => checkinMockValue,
          findById: () => parkingMockValue,
        },
      },
      RulesService,
      {
        provide: PrismaService,
        useValue: {
          checkin: { create: () => ({}) },
          parking: {
            update: () => updatedParkingValue,
          },
        },
      },
      JwtService,
    ],
  }).compile();

describe('ParkingResolver', () => {
  let resolver: ParkingResolver;
  const RealDate = Date.prototype.getDay;

  afterEach(() => (global.Date.prototype.getDay = RealDate));

  it('Checkin success', async () => {
    const module: TestingModule = await getModule(
      GET_PARKING_MOCK(ParkingType.public, 50),
      GET_CHECKIN_MOCK_VALUE(ParkingType.public, UserType.corporate),
      GET_PARKING_MOCK(ParkingType.public, 49),
    );

    resolver = module.get<ParkingResolver>(ParkingResolver);
    const result = await resolver.checkin(1, UserType.corporate);
    const { createdAt, ...data } = result;
    expect(createdAt).toBeTruthy();
    expect(data).toEqual({
      id: 1,
      parkingId: 1,
      parkingType: 'public',
      userType: UserType.corporate,
    });
  });

  it('Checkin user not allowed (private parkings)', async () => {
    const module: TestingModule = await getModule(
      GET_PARKING_MOCK(ParkingType.private, 50),
      GET_CHECKIN_MOCK_VALUE(ParkingType.private, UserType.visitor),
      GET_PARKING_MOCK(ParkingType.private, 50),
    );
    const resolver = module.get<ParkingResolver>(ParkingResolver);
    const getError = async () => {
      try {
        await resolver.checkin(1, UserType.visitor);
      } catch (e) {
        return e;
      }
    };
    expect(await getError()).toBeInstanceOf(GraphQLError);
  });

  it('Courtesy parking is closed', async () => {
    const module: TestingModule = await getModule(
      GET_PARKING_MOCK(ParkingType.courtesy, 50),
      GET_CHECKIN_MOCK_VALUE(ParkingType.courtesy, UserType.visitor),
      GET_PARKING_MOCK(ParkingType.courtesy, 50),
    );
    const resolver = module.get<ParkingResolver>(ParkingResolver);
    global.Date.prototype.getDay = () => 6;
    const getError = async () => {
      try {
        await resolver.checkin(1, UserType.visitor);
      } catch (e) {
        return e;
      }
    };
    expect(await getError()).toBeInstanceOf(GraphQLError);
  });
});
