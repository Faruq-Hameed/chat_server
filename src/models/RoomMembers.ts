import { Model } from "sequelize";
import { Table, PrimaryKey, AutoIncrement, Column, DataType, ForeignKey } from "sequelize-typescript";
import { Room } from "./Room";
import { User } from "./User";

@Table
export class RoomMember extends Model<RoomMember> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

//   @ForeignKey(() => User)
//   @Column(DataType.UUID)
//   userId!: string;

//   @ForeignKey(() => Room)
  @Column(DataType.UUID)
  roomId!: string;

  @Column(DataType.STRING)
  role?: string; // e.g., "admin", "member"
}

// RoomMember.belongsTo(Room);
// RoomMember.belongsTo(User);

