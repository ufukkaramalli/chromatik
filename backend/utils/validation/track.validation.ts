import Joi from 'joi';

const create = Joi.object({
    name: Joi.string().required(),
    url: Joi.string().required()
})

export default { create }