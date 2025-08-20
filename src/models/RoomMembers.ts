import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  ForeignKey,
  BelongsTo,
  Default,
} from "sequelize-typescript";
import { User } from "./User";
import { Room } from "./Room";

@Table({
  indexes: [{ unique: true, fields: ["userId", "roomId"] }],
  defaultScope: {
    order: [["createdAt", "DESC"]], // newest first during find all
  },
})
export class RoomMember extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @ForeignKey(() => Room)
  @Column(DataType.UUID)
  roomId!: string;

  @Column(DataType.ENUM("admin", "member"))
  role?: string;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Room)
  room!: Room;
}
