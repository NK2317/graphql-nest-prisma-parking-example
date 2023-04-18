export enum OrderByFields {
  name = 'name',
  contact = 'contact',
  spots = 'spots',
}
export enum Direction {
  asc = 'asc',
  desc = 'desc',
}
export interface OrderParkingBy {
  orderBy: OrderByFields;
  direction: Direction;
}
