import { getUserByUsername, signToken } from '@auth/services/auth.service';
import { BadRequestError, IAuthDocument } from '@ensp1re/gigme-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';


export async function tokenRefresh(req: Request, res: Response): Promise<void> {
    const existingUser: IAuthDocument | undefined = await getUserByUsername(req.params.username);
    if (!existingUser) {
        throw new BadRequestError('Invalid credentials', 'tokenRefresh() method error');
    }
    const userJWT: string = signToken(existingUser.id!, existingUser.email!, existingUser.username!);
    res.status(StatusCodes.OK).json({message: 'The token has refreshed', user: existingUser, token: userJWT});
}