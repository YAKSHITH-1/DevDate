import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, BRUTAL_SHADOWS } from '../styles/theme';
import ComicBadge from '../components/ComicBadge';
import { INITIAL_CHATS } from '../data/projectsData';

export default function ChatsScreen() {
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState('c1');
  const [inputText, setInputText] = useState('');

  const currentChat = chats.find((c) => c.id === activeChatId) || chats[0];

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      sender: 'You',
      text: inputText.trim(),
      time: 'Just now',
      isMe: true,
    };

    setChats((prev) =>
      prev.map((c) => {
        if (c.id === activeChatId) {
          return { ...c, messages: [...c.messages, newMessage] };
        }
        return c;
      })
    );

    setInputText('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>SQUAD CHAT</Text>
          <Text style={styles.headerSubtitle}>{currentChat?.projectName}</Text>
        </View>
        <ComicBadge text="LIVE FEED" color={COLORS.lime} textColor={COLORS.black} size="sm" rotate="-2deg" />
      </View>

      {/* Squad selector bar */}
      <View style={styles.channelBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.channelList}>
          {chats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              activeOpacity={0.8}
              onPress={() => setActiveChatId(chat.id)}
              style={[
                styles.channelPill,
                activeChatId === chat.id && styles.channelPillActive,
                BRUTAL_SHADOWS.xs,
              ]}
            >
              <Text style={styles.channelIcon}>{chat.avatar}</Text>
              <Text
                style={[
                  styles.channelName,
                  activeChatId === chat.id && styles.channelNameActive,
                ]}
              >
                {chat.projectName.split(' ')[0]} Squad
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Messages list */}
      <ScrollView
        style={styles.messageScroll}
        contentContainerStyle={styles.messageContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.securityBanner}>
          <Text style={styles.securityText}>🔒 Project-scoped encrypted team room. Powered by Socket.io.</Text>
        </View>

        {currentChat?.messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageBubbleWrapper,
              msg.isMe ? styles.myBubbleWrapper : styles.theirBubbleWrapper,
            ]}
          >
            {!msg.isMe && <Text style={styles.senderName}>{msg.sender}</Text>}
            <View
              style={[
                styles.bubble,
                msg.isMe ? styles.myBubble : styles.theirBubble,
                BRUTAL_SHADOWS.xs,
              ]}
            >
              <Text style={[styles.bubbleText, msg.isMe && styles.myBubbleText]}>{msg.text}</Text>
              <Text style={styles.bubbleTime}>{msg.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input composer */}
      <View style={styles.composerContainer}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Drop a pitch or update to squad..."
          placeholderTextColor={COLORS.textSecondary}
          style={styles.inputField}
        />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSendMessage}
          style={[styles.sendBtn, BRUTAL_SHADOWS.xs]}
        >
          <Text style={styles.sendIcon}>🚀</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.creamBg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.yellow,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 3.5,
    borderBottomColor: COLORS.black,
  },
  headerTitle: {
    fontSize: FONTS.xl,
    fontWeight: '900',
    color: COLORS.black,
  },
  headerSubtitle: {
    fontSize: FONTS.xs,
    fontWeight: '800',
    color: COLORS.black,
    marginTop: 2,
  },
  channelBar: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 2.5,
    borderBottomColor: COLORS.black,
    paddingVertical: 8,
  },
  channelList: {
    paddingHorizontal: SPACING.md,
    gap: 8,
  },
  channelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 6,
  },
  channelPillActive: {
    backgroundColor: COLORS.cyan,
  },
  channelIcon: {
    fontSize: 14,
  },
  channelName: {
    fontSize: FONTS.xs,
    fontWeight: '900',
    color: COLORS.black,
  },
  channelNameActive: {
    color: COLORS.black,
  },
  messageScroll: {
    flex: 1,
  },
  messageContent: {
    padding: SPACING.md,
    gap: 12,
  },
  securityBanner: {
    alignSelf: 'center',
    backgroundColor: '#FFFBEA',
    borderWidth: 1.5,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
  },
  securityText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.black,
  },
  messageBubbleWrapper: {
    maxWidth: '82%',
  },
  myBubbleWrapper: {
    alignSelf: 'flex-end',
  },
  theirBubbleWrapper: {
    alignSelf: 'flex-start',
  },
  senderName: {
    fontSize: FONTS.xs - 1,
    fontWeight: '900',
    color: COLORS.black,
    marginBottom: 2,
    marginLeft: 4,
  },
  bubble: {
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2.5,
    borderColor: COLORS.black,
  },
  myBubble: {
    backgroundColor: COLORS.yellow,
  },
  theirBubble: {
    backgroundColor: COLORS.white,
  },
  bubbleText: {
    fontSize: FONTS.sm,
    fontWeight: '700',
    color: COLORS.black,
    lineHeight: 18,
  },
  myBubbleText: {
    color: COLORS.black,
  },
  bubbleTime: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textSecondary,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  composerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderTopWidth: 3,
    borderTopColor: COLORS.black,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    gap: 8,
  },
  inputField: {
    flex: 1,
    backgroundColor: COLORS.creamBg,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: FONTS.sm,
    fontWeight: '700',
    color: COLORS.black,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.pink,
    borderWidth: 2.5,
    borderColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    fontSize: 18,
  },
});
