import WhatsMulti, { EventMap, EventMapKey } from '@dutakey/whatsmulti';
import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateSessionRequest, GetQRResponse } from './whatsapp.model';
import WebhookService from 'src/webhook';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger('WhatsappService');
  private readonly client = new WhatsMulti();

  constructor() {
    this.client.process(async (events, { sessionId, socket }) => {
      for (const [key, value] of Object.entries(events)) {
        switch (key as EventMapKey) {
          case 'open':
            this.logger.log(
              `WhatsMulti client is open for session: ${sessionId}`,
            );
            break;

          case 'connecting':
            this.logger.debug(
              `WhatsMulti client is connecting for session: ${sessionId}`,
            );
            break;

          case 'close':
            this.logger.warn(
              `WhatsMulti client is closed for session: ${sessionId}`,
            );
            break;

          case 'messages.upsert':
            await WebhookService(value as EventMap['messages.upsert'], socket);
            break;
        }
      }
    });
  }

  async onModuleInit() {
    try {
      await this.client.loadSessions();
      this.logger.log('WhatsApp client sessions loaded');
    } catch (error) {
      this.logger.error('Failed to load WhatsApp sessions', error.stack);
    }
  }

  async getSessions() {
    try {
      return this.client.getSessions();
    } catch (error) {
      this.logger.error('Error retrieving sessions', error.stack);
      throw new InternalServerErrorException(
        'Failed to retrieve WhatsApp sessions: ' + error.message,
      );
    }
  }

  async getSession(sessionId: string) {
    try {
      const session = await this.client.getSession(sessionId);
      return session;
    } catch (error) {
      this.logger.error(`Error retrieving session: ${sessionId}`, error.stack);
      throw new InternalServerErrorException(
        'Failed to retrieve WhatsApp session: ' + error.message,
      );
    }
  }

  async createSession(req: CreateSessionRequest): Promise<void> {
    try {
      await this.client.createSession(
        req.sessionId,
        req.connectionType,
        req.sockConfig,
      );
    } catch (error) {
      this.logger.error('Error creating session', error.stack);
      throw new InternalServerErrorException(
        'Failed to create WhatsApp session: ' + error.message,
      );
    }
  }

  async startSession(sessionId: string): Promise<void> {
    try {
      await this.client.startSession(sessionId);
    } catch (error) {
      this.logger.error(`Error starting session: ${sessionId}`, error.stack);
      throw new InternalServerErrorException(
        'Failed to start WhatsApp session: ' + error.message,
      );
    }
  }

  async getQr(sessionId: string): Promise<GetQRResponse | undefined> {
    try {
      return await this.client.getQr(sessionId);
    } catch (error) {
      this.logger.error(`Error getting QR: ${sessionId}`, error.stack);
      throw new InternalServerErrorException(
        'Failed to get QR code: ' + error.message,
      );
    }
  }

  async restartSession(sessionId: string) {
    try {
      return await this.client.restartSession(sessionId);
    } catch (error) {
      this.logger.error(`Error restarting session: ${sessionId}`, error.stack);
      throw new InternalServerErrorException(
        'Failed to restart session: ' + error.message,
      );
    }
  }

  async stopSession(sessionId: string) {
    try {
      return await this.client.stopSession(sessionId);
    } catch (error) {
      this.logger.error(`Error stopping session: ${sessionId}`, error.stack);
      throw new InternalServerErrorException(
        'Failed to stop session: ' + error.message,
      );
    }
  }

  async deleteSession(sessionId: string) {
    try {
      return await this.client.deleteSession(sessionId);
    } catch (error) {
      this.logger.error(`Error deleting session: ${sessionId}`, error.stack);
      throw new InternalServerErrorException(
        'Failed to delete session: ' + error.message,
      );
    }
  }
}
