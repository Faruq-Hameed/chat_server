import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import { User } from "@/models";
import { Room } from "@/models";

@Table({
  tableName: "messages",
  indexes: [
    {
      unique: true,
      fields: ["userId", "roomId"],
    },
  ],
  timestamps: true,
  defaultScope: {
    order: [["createdAt", "DESC"]], // newest first during find all
  },
})
export class Message extends Model {
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

  @UpdatedAt
  updatedAt!: Date;

  // Relations
  @BelongsTo(() => User)
  sender!: User;

  @BelongsTo(() => Room)
  room!: Room;
}
