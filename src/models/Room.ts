import { Model } from "sequelize";
import {
  PrimaryKey,
  Default,
  DataType,
  Column,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./User";
import { RoomMember } from "./RoomMembers";

export class Room extends Model<Room> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column(DataType.BOOLEAN)
  isPrivate!: boolean;
  defaultValue = false;

//   @ForeignKey(() => User)
//   @Column(DataType.UUID)
//   createdBy!: string;

  @BelongsTo(() => User)
  creator!: User;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}

// Room.hasMany(RoomMember);

