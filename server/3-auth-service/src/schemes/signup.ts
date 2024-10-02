import Joi, {ObjectSchema} from 'joi';

const signupSchema: ObjectSchema = Joi.object().keys({
    username: Joi.string().min(4).max(12).required().messages({
        'string.base': 'Username must be of type string',
        'string.min': 'Invalid username',
        'string.max': 'Invalid username',
        'string.empty': 'Username is required field'
    }),
    password: Joi.string().min(4).max(24).required().messages({
        'string.base': 'password must be of type string',
        'string.min': 'Invalid password',
        'string.max': 'Invalid password',
        'string.empty': 'password is required field',
        
    }),
    country: Joi.string().required().messages({
        'string.base': 'country must be of type string',
        'string.empty': 'country is required field'
    }),
    email: Joi.string().email().required().messages({
        'string.base': 'email must be of type string',
        'string.email': 'Invalid email',
        'string.empty': 'email is required field'
    }),
    profilePicture: Joi.string().required().messages({
        'string.base': 'Please add a profile picture',
        'string.empty': 'Profile picture is required'
    }),
    browserName: Joi.string().optional(),
    deviceType: Joi.string().optional(),

});


export {signupSchema};