import { Sequelize } from "sequelize-typescript";
import { Message, Room, RoomInvite, RoomMember, User } from "@/models";

// const sequelize = new Sequelize({
//   dialect: "mysql",
//   host: process.env.DB_HOST as string,
//   port: Number(process.env.DB_PORT as string),
//   username: process.env.DB_USER as string,
//   password: process.env.DB_PASS as string,
//   database: process.env.DB_NAME as string,
//   logging: false,
//   models: [User, Room, RoomMember, RoomInvite, Message],
// });

const sequelize = new Sequelize(process.env.DB_URL as string, {
  dialect: "mysql",
  logging: false,
  models: [User, Room, RoomMember, RoomInvite, Message],
});
export default sequelize;
