
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum ParkingType {
    "public" = "public",
    "private" = "private",
    courtesy = "courtesy"
}

export enum UserType {
    corporate = "corporate",
    provider = "provider",
    visitor = "visitor"
}

export class CreateParkingInput {
    name: string;
    contact: string;
    slots: number;
    parkingType: ParkingType;
}

export class OrderBy {
    orderBy: string;
    direction: string;
}

export class Parking {
    id: number;
    name: string;
    contact: string;
    slots: number;
    aviableSlots?: Nullable<number>;
    parkingType: ParkingType;
    createdAt?: Nullable<string>;
}

export class Checkin {
    id: number;
    parkingId: number;
    userType: UserType;
    createdAt?: Nullable<string>;
}

export abstract class IQuery {
    abstract getToken(userName: string): string | Promise<string>;

    abstract parkings(skip: number, take: number, orderBy: OrderBy): Nullable<Parking>[] | Promise<Nullable<Parking>[]>;
}

export abstract class IMutation {
    abstract createParking(createParkingInput: CreateParkingInput): Parking | Promise<Parking>;

    abstract checkin(parkingId: number, userType: UserType): Checkin | Promise<Checkin>;
}

type Nullable<T> = T | null;
