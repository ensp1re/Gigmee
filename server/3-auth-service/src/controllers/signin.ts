import { config } from '@auth/config';
import { AuthModel } from '@auth/models/auth.schema';
import { loginSchema } from '@auth/schemes/login';
import { getUserByEmail, getUserByUsername, signToken } from '@auth/services/auth.service';
import { BadRequestError, IAuthDocument, isEmail, winstonLogger } from '@ensp1re/gigme-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { omit } from 'lodash';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authenticationServer', 'debug');

export async function read(req: Request, res: Response): Promise<void> {
    try {
        // used for validation if there any details it will catch and show an error
        const { error } = await Promise.resolve(loginSchema.validate(req.body));
        if (error?.details) {
            throw new BadRequestError(error.details[0].message, 'logIn read() method error');
        }

        const { username, password } = req.body;
        const isValidEmail: boolean = isEmail(username);
        const existingUser: IAuthDocument | undefined = !isValidEmail ? await getUserByUsername(username) : await getUserByEmail(username);
        if (!existingUser) {
            throw new BadRequestError('Invalid credentials', 'SignIn read() method error');
        }

        const passwordMatch: boolean = await AuthModel.prototype.comparePassword(password, existingUser.password!);
        if (!passwordMatch) {
            throw new BadRequestError('Invalid credentials', 'SignIn read() method error');
        }

        const userJWT: string = signToken(existingUser.id!, existingUser.email!, existingUser.username!);

        // remove password from object
        const userData = omit(existingUser, ['password']);
        log.info(`User ${userData?.username} logged in successfully.`);
        res.status(StatusCodes.OK).json({ message: 'User login successfully.', user: userData, token: userJWT });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(StatusCodes.BAD_REQUEST).json({ status: 'error', message: errorMessage });
    }
}
