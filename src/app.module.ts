import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [CommonModule, WhatsappModule],
})
export class AppModule {}
