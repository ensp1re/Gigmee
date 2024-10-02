import { config } from '@auth/config';
import { getAuthUserById, getAuthUserByVerificationToken, updateVerifyEmailField } from '@auth/services/auth.service';
import { BadRequestError, IAuthDocument, winstonLogger } from '@ensp1re/gigme-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Logger } from 'winston';


const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authenticationServer', 'debug');


export async function update(req: Request, res: Response): Promise<void> {
    const {token} = req.body;

    const existingUser: IAuthDocument | undefined = await getAuthUserByVerificationToken(token);
    if (!existingUser) {
        throw new BadRequestError('Verification token is either invalid or is already user.', 'VerifyEmail update() method error');
    }

    // 1 is verified 0 is not

    await updateVerifyEmailField(existingUser.id!, 1, '');
    const updatedUser = await getAuthUserById(existingUser.id!);
    log.info(`User ${updatedUser?.username} has just verified his email`);
    res.status(StatusCodes.OK).json({message: 'Email verified successfully', user: updatedUser});

}