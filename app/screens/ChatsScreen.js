import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, BRUTAL_SHADOWS, COMIC_TEXT_SHADOW } from '../styles/theme';
import ComicBadge from '../components/ComicBadge';
import { useApp } from '../context/AppContext';

export default function ChatsScreen({ initialChatDeveloperName, onBackToMatches }) {
  const {
    chats,
    activeChatId,
    setActiveChatId,
    sendMessage,
    markChatAsRead,
    activeProject,
  } = useApp();

  const [inputText, setInputText] = useState('');

  // If instructed to open a specific developer chat from Matches
  useEffect(() => {
    if (initialChatDeveloperName) {
      const match = chats.find(
        (c) => c.developerName.toLowerCase() === initialChatDeveloperName.toLowerCase()
      );
      if (match) {
        setActiveChatId(match.id);
      }
    }
  }, [initialChatDeveloperName, chats]);

  // Derived activeChat from central AppContext
  const activeChat = activeChatId ? chats.find((c) => c.id === activeChatId) : null;

  const handleSendMessage = () => {
    if (!inputText.trim() || !activeChat) return;

    // 1. Instant local state update in AppContext (message appears immediately)
    sendMessage(activeChat.id, inputText.trim());

    // 2. SOCKET.IO INTEGRATION STRUCTURE (ready for future connection):
    // if (socket && socket.connected) {
    //   socket.emit('send_project_message', {
    //     projectId: activeChat.projectId,
    //     chatId: activeChat.id,
    //     recipientId: activeChat.developerId,
    //     text: inputText.trim(),
    //     timestamp: Date.now(),
    //   });
    // }

    setInputText('');
  };

  return (
    <View style={styles.container}>
      {activeChat ? (
        /* ================== 1. PROJECT-SPECIFIC CHAT CONVERSATION VIEW ================== */
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          {/* Thread Header with Back Button */}
          <View style={styles.threadHeader}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveChatId(null)}
              style={[styles.backBtn, BRUTAL_SHADOWS.xs]}
            >
              <Text style={styles.backBtnIcon}>←</Text>
            </TouchableOpacity>

            <Image source={{ uri: activeChat.developerAvatar }} style={styles.threadAvatar} />

            <View style={styles.threadHeaderInfo}>
              <View style={styles.threadNameRow}>
                <Text style={styles.threadDevName}>{activeChat.developerName}</Text>
                <View style={[styles.threadStatusDot, activeChat.status === 'Online' && styles.dotOnline]} />
              </View>
              <Text style={styles.threadProjectSubtitle}>{activeChat.projectName}</Text>
            </View>

            <View style={styles.threadHeaderActions}>
              <TouchableOpacity style={[styles.threadHeaderIconBtn, BRUTAL_SHADOWS.xs]}>
                <Text style={{ fontSize: 16 }}>📞</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Project / Security Header Banner */}
          <View style={styles.projectNoticeBar}>
            <Text style={styles.projectNoticeText}>
              📁 Dedicated squad channel for <Text style={{ fontWeight: '900' }}>{activeChat.projectName}</Text>
            </Text>
          </View>

          {/* Message Thread Feed */}
          <ScrollView
            style={styles.messageScroll}
            contentContainerStyle={styles.messageContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Comic Decal Sticker in Thread */}
            <View style={styles.threadStickerRow}>
              <ComicBadge
                text="GOOD CONVOS BUILD GREAT THINGS ✈️"
                color={COLORS.yellow}
                textColor={COLORS.black}
                rotate="-2deg"
                size="sm"
              />
            </View>

            {activeChat.messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  msg.isMe ? styles.myMessageRow : styles.theirMessageRow,
                ]}
              >
                {!msg.isMe && (
                  <Text style={styles.senderLabel}>{activeChat.developerName.split(' ')[0]}</Text>
                )}
                <View
                  style={[
                    styles.messageBubble,
                    msg.isMe ? styles.myBubble : styles.theirBubble,
                    BRUTAL_SHADOWS.xs,
                  ]}
                >
                  <Text style={[styles.messageText, msg.isMe && styles.myMessageText]}>
                    {msg.text}
                  </Text>
                  <View style={styles.timeRow}>
                    <Text style={[styles.msgTime, msg.isMe && styles.myMsgTime]}>{msg.time}</Text>
                    {msg.isMe && <Text style={styles.checkmarks}> ✓✓</Text>}
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Message Composer Input */}
          <View style={styles.composerBar}>
            <TouchableOpacity style={styles.attachBtn}>
              <Text style={styles.attachIcon}>📎</Text>
            </TouchableOpacity>

            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a pitch or message..."
              placeholderTextColor={COLORS.textSecondary}
              style={[styles.chatInput, BRUTAL_SHADOWS.xs]}
            />

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSendMessage}
              style={[styles.sendBtn, BRUTAL_SHADOWS.xs]}
            >
              <Text style={styles.sendIcon}>🚀</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        /* ================== 2. CHATS DIRECTORY / LIST VIEW ================== */
        <>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Chats 💬</Text>
              <Text style={styles.headerSubtitle}>Direct messages with matched devs</Text>
            </View>

            <ComicBadge
              text="TALK IDEAS BUILD TOGETHER"
              color={COLORS.yellow}
              textColor={COLORS.black}
              rotate="2deg"
              size="sm"
            />
          </View>

          <ScrollView contentContainerStyle={styles.chatListScroll} showsVerticalScrollIndicator={false}>
            {chats.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyTitle}>NO CONVERSATIONS YET!</Text>
                <Text style={styles.emptySubtitle}>
                  Swipe right on developers in Discover to send invites, or accept incoming invites in Matches to unlock squad chats!
                </Text>
                {onBackToMatches && (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={onBackToMatches}
                    style={[styles.emptyActionBtn, BRUTAL_SHADOWS.sm]}
                  >
                    <Text style={styles.emptyActionText}>GO TO MATCHES 🎯</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              chats.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  onPress={() => {
                    markChatAsRead(item.id);
                    setActiveChatId(item.id);
                  }}
                  style={[styles.chatListItem, BRUTAL_SHADOWS.md]}
                >
                  <View style={styles.avatarContainer}>
                    <Image source={{ uri: item.developerAvatar }} style={styles.listAvatar} />
                    {item.status === 'Online' && <View style={styles.onlineBadge} />}
                  </View>

                  <View style={styles.chatListDetails}>
                    <View style={styles.chatTitleRow}>
                      <Text style={styles.listDevName}>{item.developerName}</Text>
                      <Text style={styles.listTimeText}>{item.time}</Text>
                    </View>

                    <View style={styles.chatProjectBadgeRow}>
                      <Text style={styles.listProjectTag}>{item.projectName}</Text>
                    </View>

                    <Text style={styles.listSnippetText} numberOfLines={1}>
                      {item.lastMessage}
                    </Text>
                  </View>

                  {item.unreadCount > 0 && (
                    <View style={[styles.unreadBadgePill, BRUTAL_SHADOWS.xs]}>
                      <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.yellow,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 3.5,
    borderBottomColor: COLORS.black,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.black,
    marginTop: 2,
  },
  chatListScroll: {
    padding: SPACING.md,
    gap: 12,
    paddingBottom: 24,
  },
  chatListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 3.5,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  listAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2.5,
    borderColor: COLORS.black,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.lime,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  chatListDetails: {
    flex: 1,
  },
  chatTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  listDevName: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.black,
  },
  listTimeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  chatProjectBadgeRow: {
    marginBottom: 4,
  },
  listProjectTag: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.pink,
  },
  listSnippetText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  unreadBadgePill: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.pink,
    borderWidth: 1.5,
    borderColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.white,
  },
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.yellow,
    borderBottomWidth: 3.5,
    borderBottomColor: COLORS.black,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.black,
  },
  threadAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  threadHeaderInfo: {
    flex: 1,
  },
  threadNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  threadDevName: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.black,
  },
  threadStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textSecondary,
  },
  dotOnline: {
    backgroundColor: COLORS.lime,
  },
  threadProjectSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  threadHeaderActions: {
    flexDirection: 'row',
  },
  threadHeaderIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectNoticeBar: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.black,
    paddingVertical: 5,
    paddingHorizontal: SPACING.md,
  },
  projectNoticeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.black,
  },
  messageScroll: {
    flex: 1,
  },
  messageContent: {
    padding: SPACING.md,
    gap: 12,
    paddingBottom: 20,
  },
  threadStickerRow: {
    alignItems: 'center',
    marginVertical: 6,
  },
  messageRow: {
    width: '100%',
  },
  myMessageRow: {
    alignItems: 'flex-end',
  },
  theirMessageRow: {
    alignItems: 'flex-start',
  },
  senderLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.black,
    marginBottom: 2,
    marginLeft: 4,
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2.5,
    borderColor: COLORS.black,
    padding: 10,
  },
  myBubble: {
    backgroundColor: COLORS.pastelBlue,
    borderBottomRightRadius: 2,
  },
  theirBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 13,
    color: COLORS.black,
    lineHeight: 18,
    fontWeight: '600',
  },
  myMessageText: {
    color: COLORS.black,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  msgTime: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  myMsgTime: {
    color: COLORS.textSecondary,
  },
  checkmarks: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.cyan,
  },
  composerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderTopWidth: 3,
    borderTopColor: COLORS.black,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    gap: 10,
  },
  attachBtn: {
    padding: 4,
  },
  attachIcon: {
    fontSize: 20,
  },
  chatInput: {
    flex: 1,
    backgroundColor: COLORS.creamBg,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.black,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.cyan,
    borderWidth: 2,
    borderColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    fontSize: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.lg,
  },
  emptyActionBtn: {
    backgroundColor: COLORS.yellow,
    borderWidth: 3,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyActionText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.black,
  },
});
