import Joi from "joi";
import bcrypt from "bcrypt";

import { User } from "@/models";
import { LoginPayload } from "@/types/login";

/**Validator for creating user
 *@param data - Partial<User> - Partial<User> is a type that represents a subset of the User type.
 *@returns
 */
export const createUserValidator = (
  data: Partial<User>
): Joi.ValidationResult<User> => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data, {
    abortEarly: false, // show all errors, not just the first
    // stripUnknown: true, // remove unexpected fields
  });
};

export const loginValidator = (
  data: LoginPayload
): Joi.ValidationResult<LoginPayload> => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data, {
    abortEarly: false, // show all errors, not just the first
    // stripUnknown: true, // remove unexpected fields
  });
};

/**compare password with hashed password using bcrypt compare
 */
export const comparePassword = (password: string, hashedPassword: string) => {
  return bcrypt.compareSync(password, hashedPassword);
};
