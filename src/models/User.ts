import bcrypt from "bcrypt";
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Unique,
  AllowNull,
  CreatedAt,
  UpdatedAt,
  BeforeCreate,
  Default,
} from "sequelize-typescript";
import { Room } from "./Room";

@Table({
  tableName: "users",
  timestamps: true,
})
export class User extends Model<User> {
  @PrimaryKey
  @Default(DataType.UUIDV4) // Automatically generates a UUID
  @Column(DataType.UUID)
  id!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  email!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  password!: string; // will be bcrypt hashed

  @AllowNull(false)
  @Column(DataType.STRING)
  username!: string;

  @Column(DataType.BOOLEAN)
  isOnline!: boolean;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  // hash password on create
  @BeforeCreate
  static async hashPassword(user: User) {
    user.password = await bcrypt.hash(user.password, 10);
  }
}

// User.hasMany(Room, { foreignKey: "createdBy" });
// User.belongsToMany(Room, { through: RoomMember })
