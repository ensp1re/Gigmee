import crypto from 'crypto';

import { signupSchema } from '@auth/schemes/signup';
import { createAuthUser, getUserByUsernameOrEmail, signToken } from '@auth/services/auth.service';
import { BadRequestError, IAuthDocument, IEmailMessageDetails, firstLetterUppercase, lowerCase, uploads, winstonLogger } from '@ensp1re/gigme-shared';
import { Request, Response } from 'express';
import { v4 as uuidV4 } from 'uuid';
import { UploadApiResponse } from 'cloudinary';
import { config } from '@auth/config';
import { publishDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import { StatusCodes } from 'http-status-codes';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authenticationServer', 'debug');


export async function create(req: Request, res: Response): Promise<void> {
  try {
    const { error } = await Promise.resolve(signupSchema.validate(req.body));
    if (error?.details) {
      throw new BadRequestError(error.details[0].message, 'SignUp create() method error');
    }

    const { username, email, password, country, profilePicture, browserName, deviceType } = req.body;
    const checkIfUserExist: IAuthDocument | undefined = await getUserByUsernameOrEmail(username, email);
    if (checkIfUserExist) {
      throw new BadRequestError('Invalid credentials. Email or Username', 'SignUp create() method error');
    }

    const profilePublicId = uuidV4();
    const uploadResult: UploadApiResponse = await uploads(profilePicture, `${profilePublicId}`, true, true) as UploadApiResponse;
    if (!uploadResult.public_id) {
      throw new BadRequestError('File upload error. Try again', 'SignUp create() method error');
    }

    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    const authData: IAuthDocument = {
      username: firstLetterUppercase(username),
      email: lowerCase(email),
      profilePublicId,
      password,
      country,
      profilePicture: uploadResult?.secure_url,
      emailVerificationToken: randomCharacters,
      browserName,
      deviceType
    } as IAuthDocument;

    // Logging authData to ensure it has valid properties
    console.log('Auth data to be saved:', authData);

    const result: IAuthDocument = await createAuthUser(authData) as IAuthDocument;

    // Ensure result is not undefined
    if (!result) {
      throw new Error('User creation failed, result is undefined');
    }

    // Ensure result has required properties
    if (!result.id || !result.email || !result.username) {
      throw new Error('User creation result does not have required properties');
    }

    const verificationLink = `${config.CLIENT_URL}/confirm_email?v_token=${authData.emailVerificationToken}`;
    const messageDetails: IEmailMessageDetails = {
      receiverEmail: result?.email,
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

    const userJWT: string = signToken(result.id!, result.email!, result.username!);

    log.info(`User ${result.username} created the account.`);
    res.status(StatusCodes.CREATED).json({ message: 'User created successfully', user: result, token: userJWT });
  } catch (error) {
    console.error('Signup error:', error);

    // Narrowing down the error type
    if (error instanceof BadRequestError) {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: error.message,
      });
    } else if (error instanceof Error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'An unknown error occurred',
      });
    }
  }
}
