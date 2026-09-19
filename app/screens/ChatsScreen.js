import React, { useState, useEffect, useRef } from 'react';
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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, BORDERS, BRUTAL_SHADOWS } from '../styles/theme';
import ComicBadge from '../components/ComicBadge';
import { DoodleStar, DoodleCode, DoodleArrow, DoodleSparkle } from '../components/DoodleElements';
import { useApp } from '../context/AppContext';
import { resolveProfileAvatar } from '../utils/avatar';

/**
 * DevDate ChatsScreen — Playful Pop Art x Doodle Art Communication Hub
 * Zero Unicode Emojis.
 */
export default function ChatsScreen({ initialChatDeveloperName, onBackToMatches }) {
  const {
    chats,
    activeChatId,
    setActiveChatId,
    sendMessage,
    loadConversationMessages,
    messagesLoading,
    matchesLoading,
    refreshMatchesAndInvitations,
    markChatAsRead,
    activeProject,
    socketConnected,
    joinMatchRoom,
    leaveMatchRoom,
    sendTyping,
    sendStopTyping,
    typingStatusByMatch,
  } = useApp();

  // Screen state
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const messageScrollRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // If instructed to open a specific developer chat from Matches
  useEffect(() => {
    if (initialChatDeveloperName) {
      const match = chats.find(
        (c) => c.developerName?.toLowerCase() === initialChatDeveloperName.toLowerCase()
      );
      if (match) {
        setActiveChatId(match.id || match.matchId);
      }
    }
  }, [initialChatDeveloperName, chats]);

  // When active chat opens, load persisted messages from REST and join Socket.IO match room
  useEffect(() => {
    if (activeChatId) {
      if (loadConversationMessages) {
        loadConversationMessages(activeChatId);
      }
      if (joinMatchRoom) {
        joinMatchRoom(activeChatId);
      }
    }

    return () => {
      if (activeChatId) {
        if (sendStopTyping) {
          sendStopTyping(activeChatId);
        }
        if (leaveMatchRoom) {
          leaveMatchRoom(activeChatId);
        }
      }
    };
  }, [activeChatId]);

  // Derived activeChat from central AppContext
  const activeChat = activeChatId
    ? chats.find((c) => c.id === activeChatId || c.matchId === activeChatId)
    : null;

  // Auto-scroll to bottom on messages change
  useEffect(() => {
    if (activeChat?.messages?.length) {
      setTimeout(() => {
        messageScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [activeChat?.messages?.length]);

  const handleInputChange = (text) => {
    setInputText(text);

    if (activeChat) {
      const chatId = activeChat.id || activeChat.matchId;
      if (sendTyping) {
        sendTyping(chatId);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        if (sendStopTyping) {
          sendStopTyping(chatId);
        }
      }, 2500);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeChat || isSending) return;

    const textToSend = inputText.trim();
    const chatId = activeChat.id || activeChat.matchId;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (sendStopTyping) {
      sendStopTyping(chatId);
    }

    setIsSending(true);
    setSendError(null);

    const result = await sendMessage(chatId, textToSend);

    if (result && result.success) {
      setInputText('');
      setTimeout(() => {
        messageScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } else {
      setSendError(result?.error || 'Failed to dispatch message');
      setTimeout(() => setSendError(null), 3500);
    }
    setIsSending(false);
  };

  const handleQuickIcebreaker = (text) => {
    setInputText(text);
  };

  return (
    <View style={styles.container}>
      {activeChat ? (
        /* ================== 1. ACTIVE CHAT THREAD CONVERSATION VIEW ================== */
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardWrap}
        >
          {/* Thread Header with Back Button */}
          <View style={styles.threadHeader}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveChatId(null)}
              style={[styles.backBtn, BRUTAL_SHADOWS.xs]}
              accessibilityRole="button"
              accessibilityLabel="Back to conversations"
            >
              <Text style={styles.backBtnIcon}>←</Text>
            </TouchableOpacity>

            <View style={styles.avatarWrap}>
              <Image
                source={{
                  uri: resolveProfileAvatar(
                    activeChat.developerAvatar,
                    activeChat.developerName || 'Developer',
                    'voxel-bot'
                  ),
                }}
                style={styles.threadAvatar}
                onError={() => { }}
              />
              {/* Online badge */}
              <View
                style={[
                  styles.threadStatusDot,
                  (activeChat.status === 'Online' || socketConnected) ? styles.dotOnline : styles.dotOffline,
                ]}
              />
            </View>

            <View style={styles.threadHeaderInfo}>
              <View style={styles.threadNameRow}>
                <Text style={styles.threadDevName} numberOfLines={1}>
                  {activeChat.developerName}
                </Text>
                <View style={styles.connectionStatusPill}>
                  <View style={[styles.miniDot, socketConnected ? styles.miniDotGreen : styles.miniDotYellow]} />
                  <Text style={styles.connectionStatusText}>
                    {socketConnected ? 'ONLINE' : 'SYNCING'}
                  </Text>
                </View>
              </View>

              <View style={styles.projectContextRow}>
                <Text style={styles.threadProjectSubtitle} numberOfLines={1}>
                  // {activeChat.projectName || activeProject?.title || 'RIG SQUAD'}
                </Text>
              </View>
            </View>

            <View style={styles.threadHeaderActions}>
              <View style={[styles.chatBadgeWrap, BRUTAL_SHADOWS.xs]}>
                <Text style={styles.chatBadgeText}>SQUAD</Text>
              </View>
            </View>
          </View>

          {/* Project / Channel Notice Bar */}
          <View style={styles.projectNoticeBar}>
            <View style={styles.noticeLeft}>
              <DoodleCode symbol="//" color={COLORS.ink} bgColor={COLORS.yellow} style={styles.miniNoticeCode} />
              <Text style={styles.projectNoticeText}>
                Squad channel for <Text style={styles.projectNoticeBold}>{activeChat.projectName || 'DevDate Rig'}</Text>
              </Text>
            </View>
            <View style={styles.e2eBadge}>
              <Text style={styles.e2eBadgeText}>256-BIT SECURE</Text>
            </View>
          </View>

          {/* Message Thread Feed */}
          <ScrollView
            ref={messageScrollRef}
            style={styles.messageScroll}
            contentContainerStyle={styles.messageContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Decal Sticker in Thread */}
            <View style={styles.threadStickerRow}>
              <ComicBadge
                text="GOOD CONVOS BUILD GREAT RIGS"
                color={COLORS.yellow}
                textColor={COLORS.black}
                rotate="-1.5deg"
                size="sm"
              />
            </View>

            {messagesLoading && (!activeChat.messages || activeChat.messages.length === 0) ? (
              <View style={styles.loadingMessagesContainer}>
                <ActivityIndicator size="small" color={COLORS.black} />
                <Text style={styles.loadingMessagesText}>Loading squad messages...</Text>
              </View>
            ) : null}

            {/* Empty conversation placeholder */}
            {!messagesLoading && (!activeChat.messages || activeChat.messages.length === 0) ? (
              <View style={styles.emptyThreadContainer}>
                <View style={styles.emptyThreadBox}>
                  <View style={styles.emptyThreadIconRow}>
                    <DoodleStar size={22} color={COLORS.yellow} />
                    <DoodleCode symbol="HELLO" bgColor={COLORS.pillBlue} color={COLORS.blueDark || COLORS.ink} />
                    <DoodleSparkle size={18} color={COLORS.coral} />
                  </View>

                  <Text style={styles.emptyThreadTitle}>START THE TRANSMISSION!</Text>
                  <Text style={styles.emptyThreadSub}>
                    Say hello, pitch your project idea, or discuss your technical stack to squad up.
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handleQuickIcebreaker("Hey! I saw your profile and would love to collaborate.")}
                    style={[styles.icebreakerBtn, BRUTAL_SHADOWS.xs]}
                  >
                    <Text style={styles.icebreakerBtnText}>SAY HELLO --</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {/* Message Bubbles List */}
            {activeChat.messages &&
              activeChat.messages.map((msg, index) => {
                const prevMsg = activeChat.messages[index - 1];
                const isSequence = prevMsg && prevMsg.isMe === msg.isMe;

                return (
                  <View
                    key={msg.id || index}
                    style={[
                      styles.messageRow,
                      msg.isMe ? styles.myMessageRow : styles.theirMessageRow,
                      isSequence && styles.sequenceRow,
                    ]}
                  >
                    {!msg.isMe && !isSequence && (
                      <Text style={styles.senderLabel}>
                        {(msg.sender || activeChat.developerName || 'Partner').split(' ')[0]}
                      </Text>
                    )}

                    <View
                      style={[
                        styles.messageBubble,
                        msg.isMe ? styles.myBubble : styles.theirBubble,
                        BRUTAL_SHADOWS.xs,
                      ]}
                    >
                      <Text style={[styles.messageText, msg.isMe ? styles.myMessageText : styles.theirMessageText]}>
                        {msg.text}
                      </Text>

                      <View style={styles.timeRow}>
                        <Text style={[styles.msgTime, msg.isMe && styles.myMsgTime]}>
                          {msg.time || 'Just now'}
                        </Text>
                        {msg.isMe && (
                          <Text style={styles.checkmarks}> [READ]</Text>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}

            {/* Realtime Typing Indicator */}
            {activeChatId && typingStatusByMatch[activeChatId]?.isTyping ? (
              <View style={styles.typingIndicatorContainer}>
                <View style={[styles.typingBubble, BRUTAL_SHADOWS.xs]}>
                  {/* 3 Doodle Vector Dots */}
                  <View style={styles.dotsRow}>
                    <View style={styles.dotShape} />
                    <View style={[styles.dotShape, { marginHorizontal: 3 }]} />
                    <View style={styles.dotShape} />
                  </View>
                  <Text style={styles.typingIndicatorText}>
                    {typingStatusByMatch[activeChatId]?.name || activeChat.developerName} is typing...
                  </Text>
                </View>
              </View>
            ) : null}
          </ScrollView>

          {/* Send Error Notice */}
          {sendError ? (
            <View style={styles.sendErrorBanner}>
              <Text style={styles.sendErrorText}>{sendError}</Text>
            </View>
          ) : null}

          {/* Message Composer Input Bar */}
          <View style={styles.composerBar}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.attachBtn, BRUTAL_SHADOWS.xs]}
              onPress={() => setInputText((prev) => prev ? `${prev} </> ` : '</> ')}
              accessibilityRole="button"
              accessibilityLabel="Insert code tag"
            >
              <Text style={styles.attachIcon}>+</Text>
            </TouchableOpacity>

            <TextInput
              value={inputText}
              onChangeText={handleInputChange}
              placeholder="Type a pitch or message..."
              placeholderTextColor={COLORS.textSecondary}
              style={[styles.chatInput, BRUTAL_SHADOWS.xs]}
              editable={!isSending}
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
            />

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSendMessage}
              disabled={isSending || !inputText.trim()}
              style={[
                styles.sendBtn,
                BRUTAL_SHADOWS.button,
                (!inputText.trim() || isSending) && { opacity: 0.55 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Send message"
            >
              {isSending ? (
                <ActivityIndicator size="small" color={COLORS.black} />
              ) : (
                <Text style={styles.sendIconText}>SEND</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        /* ================== 2. COMMUNICATIONS DIRECTORY (MESSAGES / NOTIFICATIONS) ================== */
        <View style={styles.directoryWrapper}>
          {/* Top Yellow Comic Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>COMMUNICATIONS</Text>
              <Text style={styles.headerSubtitle}>Direct messages & squad dispatches</Text>
            </View>

            <ComicBadge
              text="POW! // SQUAD UP"
              color={COLORS.yellow}
              textColor={COLORS.black}
              rotate="1.5deg"
              size="sm"
            />
          </View>

          {/* CONVERSATION LIST */}
          <ScrollView
            contentContainerStyle={styles.chatListScroll}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={Boolean(matchesLoading)}
                onRefresh={refreshMatchesAndInvitations}
                tintColor={COLORS.black}
                colors={[COLORS.yellow, COLORS.cyan]}
              />
            }
          >
            {chats.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconWrap}>
                  <DoodleCode symbol="//" bgColor={COLORS.yellow} color={COLORS.black} style={{ paddingHorizontal: 12, paddingVertical: 6 }} />
                </View>
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
                    <Text style={styles.emptyActionText}>GO TO MATCHES --</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              chats.map((item) => (
                <TouchableOpacity
                  key={item.id || item.matchId}
                  activeOpacity={0.85}
                  onPress={() => {
                    if (markChatAsRead) markChatAsRead(item.id || item.matchId);
                    setActiveChatId(item.id || item.matchId);
                  }}
                  style={[
                    styles.chatListItem,
                    item.unreadCount > 0 ? styles.chatListItemUnread : styles.chatListItemRead,
                    BRUTAL_SHADOWS.sm,
                  ]}
                >
                  <View style={styles.avatarContainer}>
                    <Image
                      source={{
                        uri: resolveProfileAvatar(
                          item.developerAvatar,
                          item.developerName || 'Developer',
                          'voxel-bot'
                        ),
                      }}
                      style={styles.listAvatar}
                      onError={() => { }}
                    />
                    {item.status === 'Online' && <View style={styles.onlineBadge} />}
                  </View>

                  <View style={styles.chatListDetails}>
                    <View style={styles.chatTitleRow}>
                      <Text style={[styles.listDevName, item.unreadCount > 0 && styles.listDevNameUnread]} numberOfLines={1}>
                        {item.developerName}
                      </Text>
                      <Text style={styles.listTimeText}>{item.time || 'Active'}</Text>
                    </View>

                    <View style={styles.chatProjectBadgeRow}>
                      <View style={styles.projectChip}>
                        <Text style={styles.listProjectTag} numberOfLines={1}>
                            // {item.projectName || 'DevDate Rig'}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.listSnippetText,
                        item.unreadCount > 0 && styles.listSnippetTextUnread,
                      ]}
                      numberOfLines={1}
                    >
                      {item.lastMessage || 'Channel created. Tap to start chatting.'}
                    </Text>
                  </View>

                  <View style={styles.listRightCol}>
                    {item.unreadCount > 0 ? (
                      <View style={[styles.unreadBadgePill, BRUTAL_SHADOWS.xs]}>
                        <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                      </View>
                    ) : (
                      <DoodleArrow direction="right" size={14} color={COLORS.textMuted} />
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.creamBg,
  },
  keyboardWrap: {
    flex: 1,
  },
  directoryWrapper: {
    flex: 1,
  },

  // Directory Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.yellow,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: 12,
    borderBottomWidth: BORDERS.thick,
    borderBottomColor: COLORS.borderBlack,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.borderBlack,
    letterSpacing: 0.8,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.borderBlack,
    marginTop: 2,
    fontFamily: FONTS.mono,
  },

  // Active Chat Thread Header
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.yellow,
    borderBottomWidth: BORDERS.thick,
    borderBottomColor: COLORS.borderBlack,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnIcon: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.borderBlack,
    lineHeight: 22,
    marginTop: -2,
  },
  avatarWrap: {
    position: 'relative',
  },
  threadAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
  },
  threadStatusDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.borderBlack,
  },
  dotOnline: {
    backgroundColor: COLORS.lime,
  },
  dotOffline: {
    backgroundColor: COLORS.coral,
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
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.borderBlack,
    letterSpacing: 0.4,
  },
  connectionStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.white,
    borderWidth: 1.2,
    borderColor: COLORS.borderBlack,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  miniDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  miniDotGreen: {
    backgroundColor: COLORS.green,
  },
  miniDotYellow: {
    backgroundColor: COLORS.yellow,
  },
  connectionStatusText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: COLORS.borderBlack,
    fontFamily: FONTS.mono,
  },
  projectContextRow: {
    marginTop: 2,
  },
  threadProjectSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.ink,
    fontFamily: FONTS.mono,
  },
  threadHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatBadgeWrap: {
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chatBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: COLORS.borderBlack,
    letterSpacing: 0.5,
  },

  // Project Notice Bar
  projectNoticeBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.creamLight,
    borderBottomWidth: BORDERS.thin,
    borderBottomColor: COLORS.borderBlack,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  noticeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  miniNoticeCode: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginRight: 6,
  },
  projectNoticeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.ink,
  },
  projectNoticeBold: {
    fontWeight: '900',
    color: COLORS.borderBlack,
  },
  e2eBadge: {
    backgroundColor: COLORS.pillGreen,
    borderWidth: 1.2,
    borderColor: COLORS.green,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  e2eBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#15803D',
    letterSpacing: 0.4,
    fontFamily: FONTS.mono,
  },

  // Message Scroll Feed
  messageScroll: {
    flex: 1,
    backgroundColor: COLORS.creamBg,
  },
  messageContent: {
    padding: 12,
    gap: 8,
    paddingBottom: 20,
  },
  threadStickerRow: {
    alignItems: 'center',
    marginVertical: 4,
  },
  messageRow: {
    width: '100%',
    marginBottom: 4,
  },
  sequenceRow: {
    marginBottom: 2,
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
    color: COLORS.ink,
    marginBottom: 2,
    marginLeft: 4,
  },
  messageBubble: {
    maxWidth: '82%',
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  myBubble: {
    backgroundColor: COLORS.yellow,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 3,
  },
  theirBubble: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 3,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  myMessageText: {
    color: COLORS.borderBlack,
    fontWeight: '700',
  },
  theirMessageText: {
    color: COLORS.ink,
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
    color: '#4B5563',
  },
  myMsgTime: {
    color: '#4B5563',
  },
  checkmarks: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#0284C7',
    fontFamily: FONTS.mono,
  },

  // Empty Thread State
  emptyThreadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
  },
  emptyThreadBox: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.xl,
    padding: 20,
    alignItems: 'center',
    ...BRUTAL_SHADOWS.sm,
  },
  emptyThreadIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  emptyThreadTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.borderBlack,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  emptyThreadSub: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 14,
  },
  icebreakerBtn: {
    backgroundColor: COLORS.yellow,
    borderWidth: 2,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  icebreakerBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.borderBlack,
    letterSpacing: 0.5,
  },

  // Typing Indicator
  typingIndicatorContainer: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    alignItems: 'flex-start',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF9C3',
    borderWidth: 2,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotShape: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.borderBlack,
  },
  typingIndicatorText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.borderBlack,
  },

  // Composer Bar
  composerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderTopWidth: BORDERS.thick,
    borderTopColor: COLORS.borderBlack,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  attachBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.creamBg,
    borderWidth: 2,
    borderColor: COLORS.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachIcon: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.borderBlack,
    lineHeight: 22,
  },
  chatInput: {
    flex: 1,
    backgroundColor: COLORS.creamBg,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 9 : 7,
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.borderBlack,
  },
  sendBtn: {
    backgroundColor: COLORS.yellow,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIconText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.borderBlack,
    letterSpacing: 0.6,
  },

  // Errors and Loaders
  sendErrorBanner: {
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: 6,
    alignSelf: 'center',
  },
  sendErrorText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B91C1C',
  },
  loadingMessagesContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingMessagesText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },

  // Conversation Directory List
  chatListScroll: {
    padding: SPACING.md,
    gap: 10,
    paddingBottom: 32,
  },
  chatListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    padding: 12,
    gap: 12,
  },
  chatListItemUnread: {
    backgroundColor: COLORS.white,
  },
  chatListItemRead: {
    backgroundColor: '#FAF7EE',
  },
  avatarContainer: {
    position: 'relative',
  },
  listAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2.2,
    borderColor: COLORS.borderBlack,
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
    borderColor: COLORS.borderBlack,
  },
  avatarFallback: {
    backgroundColor: COLORS.yellow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.borderBlack,
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
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.ink,
    flex: 1,
    marginRight: 6,
  },
  listDevNameUnread: {
    fontWeight: '900',
    color: COLORS.borderBlack,
  },
  listTimeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  chatProjectBadgeRow: {
    marginBottom: 4,
  },
  projectChip: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.creamDark,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    maxWidth: '90%',
  },
  listProjectTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.ink,
    fontFamily: FONTS.mono,
  },
  listSnippetText: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  listSnippetTextUnread: {
    color: COLORS.borderBlack,
    fontWeight: '700',
  },
  listRightCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgePill: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.coral,
    borderWidth: 1.8,
    borderColor: COLORS.borderBlack,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: COLORS.white,
  },

  // Directory Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.xl,
    padding: 24,
    marginTop: 20,
    ...BRUTAL_SHADOWS.sm,
  },
  emptyIconWrap: {
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.borderBlack,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  emptyActionBtn: {
    backgroundColor: COLORS.yellow,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  emptyActionText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.borderBlack,
    letterSpacing: 0.5,
  },
});
