import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { CreateSessionRequest, HandleSessionRequest } from './whatsapp.model';

@Controller()
export class WhatsappController {
  private readonly logger = new Logger('WhatsappController');

  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('/sessions')
  async getSessions() {
    try {
      const sessions = await this.whatsappService.getSessions();
      return {
        message: 'Sessions retrieved successfully',
        data: sessions,
      };
    } catch (error) {
      this.logger.error('Error retrieving sessions', error.stack);
      throw new InternalServerErrorException(
        'Failed to retrieve sessions: ' + error.message,
      );
    }
  }

  @Get('/session/:sessionId')
  async getSession(@Param('sessionId') sessionId: string) {
    try {
      const session = await this.whatsappService.getSession(sessionId);
      if (!session) {
        throw new BadRequestException(`Session with ID ${sessionId} not found`);
      }
      return {
        message: `Session ${sessionId} retrieved successfully`,
        data: session,
      };
    } catch (error) {
      this.logger.error('Error retrieving session', error.stack);
      throw new InternalServerErrorException(
        'Failed to retrieve session: ' + error.message,
      );
    }
  }

  @Post('/create-session')
  async createSession(@Body() request: CreateSessionRequest) {
    try {
      await this.whatsappService.createSession(request);
      return {
        message: 'Session created successfully',
        sessionId: request.sessionId,
      };
    } catch (error) {
      this.logger.error('Error creating session', error.stack);
      throw new BadRequestException(error.message);
    }
  }

  @Post('/start-session')
  async startSession(@Body() req: HandleSessionRequest) {
    try {
      await this.whatsappService.startSession(req.sessionId);
      return {
        message: 'Session started successfully',
        sessionId: req.sessionId,
      };
    } catch (error) {
      this.logger.error('Error starting session', error.stack);
      throw new BadRequestException(error.message);
    }
  }

  @Post('/restart-session')
  async restartSession(@Body() body: { sessionId: string }) {
    try {
      await this.whatsappService.restartSession(body.sessionId);
      return {
        message: 'Session restarted successfully',
        sessionId: body.sessionId,
      };
    } catch (error) {
      this.logger.error('Error restarting session', error.stack);
      throw new InternalServerErrorException(
        'Failed to restart session: ' + error.message,
      );
    }
  }

  @Post('/stop-session')
  async stopSession(@Body() body: { sessionId: string }) {
    try {
      await this.whatsappService.stopSession(body.sessionId);
      return {
        message: 'Session stopped successfully',
        sessionId: body.sessionId,
      };
    } catch (error) {
      this.logger.error('Error stopping session', error.stack);
      throw new InternalServerErrorException(
        'Failed to stop session: ' + error.message,
      );
    }
  }

  @Delete('/delete-session')
  async deleteSession(@Body() body: { sessionId: string }) {
    try {
      await this.whatsappService.deleteSession(body.sessionId);
      return {
        message: 'Session deleted successfully',
        sessionId: body.sessionId,
      };
    } catch (error) {
      this.logger.error('Error deleting session', error.stack);
      throw new InternalServerErrorException(
        'Failed to delete session: ' + error.message,
      );
    }
  }

  @Get('/qr/:sessionId')
  async getQr(@Param('sessionId') sessionId: string) {
    try {
      const qrData = await this.whatsappService.getQr(sessionId);
      return {
        message: `QR code for session ${sessionId} retrieved successfully`,
        data: qrData,
      };
    } catch (error) {
      this.logger.error('Error retrieving QR', error.stack);
      throw new InternalServerErrorException(
        'Failed to retrieve QR code: ' + error.message,
      );
    }
  }
}
