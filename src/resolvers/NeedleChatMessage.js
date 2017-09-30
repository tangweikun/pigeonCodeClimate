import { maybeCreateFromHexString } from '../utils'

export const NeedleChatMessage = {
  __resolveType(obj, context, info) {
    if (obj.messageType === 'TEXT') {
      return 'NeedleTextMessage'
    }
    if (obj.messageType === 'AUDIO') {
      return 'NeedleAudioMessage'
    }
    if (obj.messageType === 'IMAGE') {
      return 'NeedleImageMessage'
    }
    throw new Error(`Unrecognized chat message type: ${obj.type}`)
  },
}

export const sharedNeedleChatMessageResolvers = {
  async sender(needleChatMessage, _, { getDb }) {
    const db = getDb === undefined ? global.db : await getDb()

    // TODO(tangweikun) Hard Cord should replace of healthCareProfessional id
    const userId =
      needleChatMessage.senderId === '66728d10dc75bc6a43052036'
        ? needleChatMessage.senderId
        : maybeCreateFromHexString(needleChatMessage.senderId)

    return db.collection('users').findOne({ _id: userId })
  },
  async needleChatRoom(needleChatMessage, _, { getDb }) {
    const db = getDb === undefined ? global.db : await getDb()
    return db
      .collection('needleChatRooms')
      .findOne({ _id: needleChatMessage.chatRoomId })
  },
}
