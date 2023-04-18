/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ParkingService } from './parking.service';
import { ParkingResolver } from './parking.resolver';
import { RulesService } from './rules.service';
import { JwtModule } from '@nestjs/jwt';
import { JWTStrategy } from '../auth/jwt.strategy';

@Module({
  imports: [JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '1h' },
  })],
  providers: [ParkingResolver, ParkingService, RulesService, JWTStrategy],
})
export class ParkingModule { }
