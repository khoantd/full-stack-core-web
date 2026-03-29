import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class FriendGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // email → socketId map
  private emailSocketMap = new Map<string, string>();

  // offline inboxes: recipientEmail → unread count
  private unreadCounts = new Map<string, number>();

  // --- Connection lifecycle ---

  handleConnection(client: Socket) {
    const email = client.handshake.auth.email;
    if (email) {
      this.emailSocketMap.set(email, client.id);
      console.log(`✅ Socket connected: ${email} - ${client.id}`);
      // Broadcast online status to all OTHER clients
      client.broadcast.emit('friend:status', { email, status: 'online' });

      // Send pending unread count to the newly connected user
      const unread = this.unreadCounts.get(email) ?? 0;
      if (unread > 0) {
        client.emit('friend:unread', { unread });
        this.unreadCounts.delete(email);
      }
    } else {
      console.warn('❌ Client connected without email!');
    }
  }

  handleDisconnect(client: Socket) {
    const disconnectedEmail = [...this.emailSocketMap.entries()]
      .find(([, id]) => id === client.id)?.[0];

    if (disconnectedEmail) {
      this.emailSocketMap.delete(disconnectedEmail);
      console.log(`🔌 Disconnected: ${disconnectedEmail}`);
      // Broadcast offline status to all connected clients
      this.server.emit('friend:status', { email: disconnectedEmail, status: 'offline' });
    }
  }

  // --- Client → Server events ---

  /** Send a direct message to another user */
  @SubscribeMessage('friend:message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { to: string; text: string },
  ) {
    const senderEmail = [...this.emailSocketMap.entries()]
      .find(([, id]) => id === client.id)?.[0];

    if (!senderEmail) return;

    const targetSocketId = this.emailSocketMap.get(payload.to);
    const message = {
      from: senderEmail,
      text: payload.text,
      sentAt: new Date().toISOString(),
    };

    if (targetSocketId) {
      // Recipient is online — deliver immediately
      this.server.to(targetSocketId).emit('friend:message', message);
    } else {
      // Recipient is offline — increment unread badge
      const current = this.unreadCounts.get(payload.to) ?? 0;
      this.unreadCounts.set(payload.to, current + 1);
    }

    // Echo back to sender for confirmation / own UI update
    client.emit('friend:message:sent', message);
  }

  /** Get list of currently online users */
  @SubscribeMessage('friend:online-list')
  handleOnlineList(@ConnectedSocket() client: Socket) {
    const onlineEmails = [...this.emailSocketMap.keys()];
    client.emit('friend:online-list', { onlineEmails });
  }

  // --- Internal helper (used by other backend services) ---

  sendFriendRequest(recipientEmail: string, payload: any) {
    const socketId = this.emailSocketMap.get(recipientEmail);
    if (socketId) {
      this.server.to(socketId).emit('friend-request', payload);
    }
  }

  isOnline(email: string): boolean {
    return this.emailSocketMap.has(email);
  }
}