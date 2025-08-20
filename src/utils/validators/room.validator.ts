import Joi from "joi";

export const createRoomValidator = (data: Record<string, any>) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    description: Joi.string(),
    isPrivate: Joi.boolean().default(false),
  });
  return schema.validate(data, {
    abortEarly: false, // show all errors, not just the first
    stripUnknown: true, // remove unexpected fields
  });
};

