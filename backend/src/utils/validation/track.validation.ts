import Joi from 'joi';

const create = Joi.object({
  name: Joi.string().required(),
  url: Joi.string().required(),
  description: Joi.string().optional(),
  art: Joi.string().optional(),
  status: Joi.string().optional(),
  userId: Joi.string().required()
});

const update = Joi.object({
  name: Joi.string().optional(),
  url: Joi.string().optional(),
  description: Joi.string().optional(),
  art: Joi.string().optional(),
  status: Joi.string().optional(),
  userId: Joi.string().required()
});

const deleteTrack = Joi.object({
  userId: Joi.string().required()
});

export default { create, update, deleteTrack };