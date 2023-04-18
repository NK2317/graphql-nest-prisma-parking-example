import { ParkingType } from '@prisma/client';

export const GET_PARKING_MOCK = (
  parkingType: ParkingType,
  aviableSlots: number,
) => ({
  id: 1,
  name: 'name',
  contact: '3411297865',
  parkingType,
  slots: 50,
  aviableSlots,
  createdAt: new Date(),
});
