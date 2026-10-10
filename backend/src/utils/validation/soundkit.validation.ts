import Joi from "joi";

const create = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    thumbnailUrl: Joi.string(),
    url: Joi.string().required(),
    userId: Joi.string().required()
})

const deleteSoundkit = Joi.object({
    userId: Joi.string().required()
})

export default { create, deleteSoundkit }