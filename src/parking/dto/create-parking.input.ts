import { ParkingType } from '@prisma/client';

export class CreateParkingInput {
  name: string;
  contact: string;
  slots: number;
  parkingType: ParkingType;
}
