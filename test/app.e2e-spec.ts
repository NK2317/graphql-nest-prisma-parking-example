/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { GET_PARKING_MOCK } from './mocks';
import { ParkingType, UserType } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const jwtTokenService = new JwtService({
    secretOrPrivateKey: process.env.JWT_SECRET,
  });
  const parkingMock = GET_PARKING_MOCK(ParkingType.public, 50);
  const mockPrismaService = {
    parking: {
      findMany: jest.fn().mockResolvedValue([parkingMock]),
      findUnique: jest.fn().mockResolvedValue(parkingMock),
      create: jest.fn().mockResolvedValue(parkingMock),
      findFirst: jest.fn().mockResolvedValue(parkingMock),
    },
  };
  const originalGetDay = global.Date.prototype.getDay;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [JwtService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(() => {
    global.Date.prototype.getDay = originalGetDay;
  });

  it('Create parking (happy path)', async () => {
    const token = jwtTokenService.sign({ userName: 'NK2317' });
    const mock = {
      id: 5,
      name: 'Cordova 1235',
      contact: '3411297865',
      slots: 50,
      aviableSlots: 50,
      parkingType: 'public',
    };
    mockPrismaService.parking.findFirst = jest.fn().mockResolvedValue(null);
    mockPrismaService.parking.create = jest.fn().mockResolvedValue(mock);
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: `mutation {
            createParking(createParkingInput: {
              name: "Cordova 1235",
              contact: "3411297865",
              parkingType: ${ParkingType.public},
              slots: 50,
            }) {
              id
              name
              contact
              slots
              aviableSlots
              parkingType
            }
          }
        `,
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.data.createParking).toEqual(mock);
  });

  it('Fails create parking because wrong slots', async () => {
    const token = jwtTokenService.sign({ userName: 'NK2317' });
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: `mutation {
            createParking(createParkingInput: {
              name: "Cordova 1235",
              contact: "3411297865",
              parkingType: ${ParkingType.public},
              slots: 48,
            }) {
              id
              name
              contact
              slots
              aviableSlots
              parkingType
            }
          }
        `,
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      errors: [
        {
          message: 'Invalid request',
          locations: [{ line: 2, column: 13 }],
          path: ['createParking'],
          extensions: {
            code: 'INVALID_REQUEST',
            validationError: {
              _original: {
                name: 'Cordova 1235',
                contact: '3411297865',
                slots: 48,
                parkingType: 'public',
              },
              details: [
                {
                  message: '"slots" must be greater than 49',
                  path: ['slots'],
                  type: 'number.greater',
                  context: {
                    limit: 49,
                    value: 48,
                    label: 'slots',
                    key: 'slots',
                  },
                },
              ],
            },
            exception: { message: 'Invalid request' },
          },
        },
      ],
      data: null,
    });
  });

  it('Get all parkings', async () => {
    const token = jwtTokenService.sign({ userName: 'NK2317' });
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: `{
            parkings(skip: ${0}, take: ${1}, orderBy: { orderBy: "name", direction: "desc" }) {
              id
              name
              contact
              slots
              aviableSlots
              parkingType
            }
          }
        `,
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      data: {
        parkings: [
          {
            id: 1,
            name: 'name',
            contact: '3411297865',
            slots: 50,
            aviableSlots: 50,
            parkingType: 'public',
          },
        ],
      },
    });
  });

  it('UserType not allowed', async () => {
    mockPrismaService.parking.findUnique = jest
      .fn()
      .mockResolvedValue(GET_PARKING_MOCK(ParkingType.private, 50));
    const token = jwtTokenService.sign({ userName: 'NK2317' });
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: `mutation {
            checkin(parkingId: 1, userType: ${UserType.visitor}) {
              id
              parkingId
              userType
            }
          }
        `,
      });
    expect(response.body.errors[0]).toEqual({
      message: 'You must be a corporate user to join this parking',
      locations: [{ line: 2, column: 13 }],
      path: ['checkin'],
      extensions: {
        code: 'USER_NOT_ALLOWED_IN_PARKING',
        exception: {
          message: 'You must be a corporate user to join this parking',
        },
      },
    });
  });

  it('Closed courtesy parking', async () => {
    global.Date.prototype.getDay = () => 6;
    mockPrismaService.parking.findUnique = jest
      .fn()
      .mockResolvedValue(GET_PARKING_MOCK(ParkingType.courtesy, 50));
    const token = jwtTokenService.sign({ userName: 'NK2317' });
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: `mutation {
            checkin(parkingId: 1, userType: ${UserType.visitor}) {
              id
              parkingId
              userType
            }
          }
        `,
      });
    expect(response.body.errors[0]).toEqual({
      message: 'Courtesy parkings are open only in woring days',
      locations: [{ line: 2, column: 13 }],
      path: ['checkin'],
      extensions: {
        code: 'COURTESY_PARKING_CLOSED',
        exception: {
          message: 'Courtesy parkings are open only in woring days',
        },
      },
    });
  });
});
