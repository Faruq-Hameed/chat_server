import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
  Default,
  PrimaryKey,
  CreatedAt,
  BelongsTo,
} from "sequelize-typescript";
import { Room } from "@/models";
import { User } from "@/models";

@Table({ tableName: "room_invites" })
export class RoomInvite extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Room)
  @Column(DataType.UUID)
  roomId!: string;

  @ForeignKey(() => User) // who created the invite
  @Column(DataType.UUID)
  createdBy!: string;

  @Column(DataType.STRING)
  token!: string; // unique random string ( shortid)

  @Column(DataType.DATE)
  expiresAt!: Date;

  @CreatedAt
  createdAt!: Date;

  @BelongsTo(() => Room)
  room!: Room;

  @BelongsTo(() => User)
  creator!: User;
}
