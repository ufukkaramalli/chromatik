import Joi from 'joi'

const register = Joi.object({
  name: Joi.string().max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  isValidPassword: Joi.any()
    .equal(Joi.ref('password'))
    .required()
    .label('Confirm password')
    .options({ messages: { 'any.only': '{{#label}} does not match' } })
});

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const update = Joi.object({
  name: Joi.string().max(30).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  isValidPassword: Joi.any()
    .equal(Joi.ref('password'))
    .optional()
    .label('Confirm password')
    .options({ messages: { 'any.only': '{{#label}} does not match' } }),
  role: Joi.string().valid('producer', 'listener', 'admin').optional(),
  photoUrl: Joi.string().optional(),
  language: Joi.string().optional()
});

export default { register, login, update };