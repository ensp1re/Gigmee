import crypto from 'crypto';

import { getAuthUserById, getUserByEmail, updateVerifyEmailField } from '@auth/services/auth.service';
import { BadRequestError, IAuthDocument, IEmailMessageDetails, lowerCase } from '@ensp1re/gigme-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { config } from '@auth/config';
import { authChannel } from '@auth/server';
import { publishDirectMessage } from '@auth/queues/auth.producer';


export async function currentUser(req: Request, res: Response): Promise<void> {
    if (!req.currentUser) {
        res.status(StatusCodes.UNAUTHORIZED).json({message: 'User not authenticated'});
        return;
    }

    const existingUser: IAuthDocument | undefined = await getAuthUserById(req.currentUser.id);
    if (!existingUser) {
        res.status(StatusCodes.NOT_FOUND).json({message: 'User not found'});
        return;
    }

    res.status(StatusCodes.OK).json({message: 'Authenticated user', user: existingUser});
}

export async function resendEmail(req: Request, res: Response): Promise<void> {
    try {
        const { email, userId } = req.body;

        if (!email || !userId) {
            throw new BadRequestError('Email and userId are required', 'resendEmail() validation error');
        }

        const lowerCasedEmail = lowerCase(email);
        const numericUserId = parseInt(userId);

        const isUserExist: IAuthDocument | undefined = await getUserByEmail(lowerCasedEmail);
        if (!isUserExist) {
            throw new BadRequestError('Email is invalid', 'resendEmail() method error');
        }

        const randomBytes: Buffer = crypto.randomBytes(20);
        const randomCharacters: string = randomBytes.toString('hex');

        const verificationLink = `${config.CLIENT_URL}/confirm_email?v_token=${randomCharacters}`;
        await updateVerifyEmailField(numericUserId, 0, randomCharacters);

        const messageDetails: IEmailMessageDetails = {
            receiverEmail: lowerCasedEmail,
            verifyLink: verificationLink,
            template: 'verifyEmail'
        };

        await publishDirectMessage(
            authChannel,
            'gigme-email-notification',
            'auth-email',
            JSON.stringify(messageDetails),
            'Verify email message has been sent to notification service.'
        );

        const updateUser = await getAuthUserById(numericUserId);
        res.status(StatusCodes.OK).json({ message: 'Email verification sent', user: updateUser });

    } catch (error) {
        let errorMessage = 'An error occurred while resending email';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error('Error in resendEmail:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: errorMessage });
    }
}