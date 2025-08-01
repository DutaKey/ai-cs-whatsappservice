import { ConnectionType, SockConfig } from '@dutakey/whatsmulti';

export class CreateSessionRequest {
  sessionId: string;
  connectionType: ConnectionType;
  sockConfig?: Partial<SockConfig>;
}

export class GetQRResponse {
  image: string;
  qr: string;
}

export class HandleSessionRequest {
  sessionId: string;
}
