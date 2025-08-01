import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';

const WebhookService = async (data: any, socket: any) => {
  const configService = new ConfigService();
  const logger = new Logger('WebhookService');

  const webhookUrl = configService.get<string>('WEBHOOK_URL');
  const jwtSecret = configService.get<string>('JWT_SECRET');

  if (!webhookUrl || !jwtSecret) {
    logger.error('Missing WEBHOOK_URL or JWT_SECRET in environment');
    throw new Error('Configuration error');
  }

  const generateToken = () => {
    try {
      return jwt.sign({}, jwtSecret);
    } catch (err) {
      logger.error('Failed to generate JWT token', err);
      return '';
    }
  };

  const processMessage = async (message: any) => {
    try {
      const fromMe = message?.key?.fromMe;
      const isGroup = message?.key?.remoteJid?.endsWith('@g.us');
      const jid = message?.key?.remoteJid;
      const pushName = message?.pushName || 'Unknown';
      const conversation = message?.message?.conversation;
      const locationMessage = message?.message?.locationMessage;

      if (!jid || fromMe || isGroup) return;

      const latLong = locationMessage
        ? `${locationMessage.degreesLatitude},${locationMessage.degreesLongitude}`
        : null;

      logger.debug(`From ${pushName}: ${conversation || '[non-text message]'}`);

      socket?.readMessages?.([message.key]);
      await socket?.sendPresenceUpdate('composing');

      const payload = { pushName, jid, conversation, latLong };

      const token = generateToken();

      const response = await axios.post(webhookUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const replyMessage = response?.data?.reply ? response.data.message : null;

      if (replyMessage && jid) {
        logger.debug(`Reply to ${jid}: ${replyMessage}`);

        socket?.sendPresenceUpdate('available');
        await socket?.sendMessage?.(jid, { text: replyMessage });
      }
    } catch (error) {
      logger.error(
        'Error processing individual message:',
        error?.message || error,
      );
    }
  };

  try {
    if (!data?.messages || !Array.isArray(data.messages)) {
      logger.warn('No valid messages found in data');
      return;
    }

    for (const message of data.messages) {
      await processMessage(message);
    }
  } catch (error) {
    logger.error('Fatal error in WebhookService:', error?.message || error);
    throw new Error(
      'Failed to process webhook: ' + (error?.message || 'Unknown error'),
    );
  }
};

export default WebhookService;
