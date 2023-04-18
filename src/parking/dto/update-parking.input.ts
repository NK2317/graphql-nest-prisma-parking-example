import { CreateParkingInput } from './create-parking.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateParkingInput extends PartialType(CreateParkingInput) {
  id: number;
}
