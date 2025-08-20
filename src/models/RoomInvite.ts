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
  Unique,
} from "sequelize-typescript";
import { Room } from "@/models";
import { User } from "@/models";

@Table({ tableName: "room_invites" })
export class RoomInvite extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Unique("room_invites_roomId_unique") // a room can only have an invite link roq
  @ForeignKey(() => Room)
  @Column(DataType.UUID)
  roomId!: string;

  @ForeignKey(() => User) // who created the invite
  @Column(DataType.UUID)
  createdBy!: string;

  @Column(DataType.STRING)
  inviteCode!: string; // unique random string ( shortid)

  //   @Column(DataType.DATE)
  //   expiresAt!: Date;

  @CreatedAt
  createdAt!: Date;

  @BelongsTo(() => Room)
  room!: Room;

  @BelongsTo(() => User)
  creator!: User;
}
