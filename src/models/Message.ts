import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
} from "sequelize-typescript";
import { User } from "@/models";
import { Room } from "@/models";

@Table({
  tableName: "messages",
  timestamps: true,
  updatedAt: false, //no need to update time since the chats are not editable
})
export class Message extends Model<Message> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @ForeignKey(() => Room)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  roomId!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  content!: string;

  @Column({
    type: DataType.ENUM("delivered", "read"),
    allowNull: false,
    defaultValue: "delivered",
  })
  status!: "delivered" | "read"; //delivered means sent while read means at least one user has read it

  @CreatedAt
  createdAt!: Date;

  // Relations
  @BelongsTo(() => User)
  sender!: User;

  @BelongsTo(() => Room)
  room!: Room;
}
