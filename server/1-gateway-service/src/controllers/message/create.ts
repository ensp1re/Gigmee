import { AxiosResponse } from 'axios';
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { messageService } from '@gateway/services/api/message.service';

export class Create {
  public async message(req: Request, res: Response): Promise<void> {
    try {
      console.log(req.body);
      const response: AxiosResponse = await messageService.addMessage(req.body);
      console.log(response);
      res
        .status(StatusCodes.OK)
        .json({ message: response.data.message, conversationId: response.data.conversationId, messageData: response.data.messageData });
    } catch (error) {
      console.error('Error creating message', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error creating message' });
    }
  }
}
