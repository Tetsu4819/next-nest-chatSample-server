import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  afterInit() {
    this.logger.log('Initialized!');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected:${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected:${client.id}`);
  }

  // @SubscribeMessage('msgToServer')
  // handleMessage(client: Socket, text: string): WsResponse<string> {
  //   return { event: 'msgToClient', data: text };
  // }

  @SubscribeMessage('msgToServer')
  handleMessage(
    @MessageBody() data: { room: string; name: string; message: string },
  ) {
    this.logger.log('name is ' + data.name);
    this.logger.log('msg is ' + data.message);
    this.server.to(data.room).emit('msgToClient', data);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() loginInfo: { room: string; name: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = loginInfo.room;
    const name = loginInfo.name;
    client.join(room);
    client.emit('joinedRoom', { room: room, name: name });
    this.server.to(room).emit('msgToClient', {
      room: room,
      name: 'System',
      message: name + ' entered room!',
    });
  }
}
