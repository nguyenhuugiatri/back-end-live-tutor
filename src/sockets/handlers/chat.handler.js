import { onlineUsers } from '../controllers';
import { messageService } from 'services';

const chatHandler = (io, socket) => {
  const returnMessages = async ({ fromId, toId }) => {
    const socketIds = [
      ...(await onlineUsers.getSocketIdsByUserId(fromId)),
      ...(await onlineUsers.getSocketIdsByUserId(toId)),
    ];
    const messages = await messageService.getManyByUserIds(fromId, toId);
    socketIds.forEach((socketId) =>
      io.to(socketId).emit('chat:returnMessages', {
        messages,
      }),
    );
  };

  const returnRecentList = async (userId) => {
    const socketIds = await onlineUsers.getSocketIdsByUserId(userId);
    const recentList = await messageService.getRecentConversations(userId);
    const unreadCount = recentList.reduce((acc, curr) => {
      if (curr?.toInfo?.id === userId && !curr.isRead) {
        return ++acc;
      }
      return acc;
    }, 0);

    socketIds.forEach((socketId) =>
      io.to(socketId).emit('chat:returnRecentList', {
        recentList,
        unreadCount,
      }),
    );
  };

  socket.on('chat:getRecentList', async () => {
    const user = await onlineUsers.getUserBySocketId(socket.id);
    returnRecentList(user?.id);
  });

  socket.on('chat:getMessages', async ({ fromId, toId }) => {
    returnMessages({ fromId, toId });
  });

  socket.on('chat:sendMessage', async ({ fromId, toId, content }) => {
    if (!fromId || !toId || !content) return;
    await messageService.createOne({
      fromId,
      toId,
      content,
      isRead: false,
      createdAt: new Date(),
    });
    returnMessages({ fromId, toId });
    returnRecentList(fromId);
    returnRecentList(toId);
  });

  socket.on('chat:readMessage', async ({ conversation }) => {
    if (!conversation) return;

    const {
      fromInfo: { id: fromId },
      toInfo: { id: toId },
    } = conversation;
    const user = await onlineUsers.getUserBySocketId(socket.id);
    await messageService.updateOne(conversation);
    returnRecentList(user?.id);
    returnMessages({
      fromId,
      toId,
    });
  });
};

export default chatHandler;
