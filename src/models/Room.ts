import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  DataType,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
  BelongsTo,
  HasMany,
  BelongsToMany,
  Index,
} from "sequelize-typescript";
import { User } from "./User";
import { RoomMember } from "./RoomMembers";
import { Message } from "./Message";

@Table({
  tableName: "rooms",
  defaultScope: {
    order: [["createdAt", "DESC"]], // newest first during find all
  },
})
export class Room extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isPrivate!: boolean;

  @Index("createdBy")
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  createdBy!: string;

  @BelongsTo(() => User)
  creator!: User;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  // members = join rows
  @HasMany(() => RoomMember)
  members!: RoomMember[];

  // users = shortcut to users through RoomMember
  @BelongsToMany(() => User, () => RoomMember)
  users!: User[];

  @HasMany(() => Message)
  messages!: Message[];
}
