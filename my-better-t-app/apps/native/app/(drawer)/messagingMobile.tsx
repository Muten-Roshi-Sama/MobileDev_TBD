// messagingMobile.tsx

// Native
import { View, Text, ScrollView, Alert, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Surface, TextField } from "heroui-native";
import { Container } from "@/components/container";

// React
import { orpc } from "@/utils/orpc";
import React, { useState, useEffect } from "react";
import { useUser, useMessages, useConversations } from "@my-better-t-app/hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

// Websockets
import { useConversationStream } from "@my-better-t-app/hooks/websocket/useConversationStream";




type ConversationItem = ReturnType<typeof useConversations>["conversations"][number];


// ------ Helper --------
function formatTime(value: Date | string | number | null | undefined) {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

// -------- Layout ---------
function ChatLayout({
  children: [sidebar, chatWindow],
}: {
  children: [React.ReactNode, React.ReactNode];
}) {
  return (
    <View className="flex-1 flex-row bg-background">
      <View className="w-80 border-r border-border flex-col">{sidebar}</View>
      <View className="flex-1 flex-col">{chatWindow}</View>
    </View>
  );
}

// ======= 1. SideBar ===========

function SideBar({ children }: { children: React.ReactNode }) {
  return <View className="flex-1 flex-col">{children}</View>;
}

function SearchBar({
  searchText,
  setSearchText,
  }: {
    searchText: string;
    setSearchText: (value: string) => void;
  }) {
  return (
    <View className="px-4 py-3 border-b border-border">
      <TextField>
        <TextField.Input
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search..."
          autoCapitalize="none"
          autoCorrect={false}
        />
      </TextField>
    </View>
  );
}

function ConversationList({
  conversations,
  search,
  searchText,
  // selectedConversationId,
  // onSelectConversation,
  }: {
  conversations: ConversationItem[];
  search: ReturnType<typeof useUser>["search"];
  searchText: string;
  // selectedConversationId: string | null;
  // onSelectConversation: (conversationId: string) => void;
  }) {
  const query = searchText.trim().toLowerCase();

  const visibleConversations =
    query.length > 1
      ? conversations.filter((conversation) =>
          search.users.some((user) =>
            conversation.participants.some((participant) => participant.userId === user.id),
          ),
        )
      : conversations;

  return (
    <ScrollView className="flex-1 border-b border-border">
      {visibleConversations.length > 0 ? (
        visibleConversations.map((conversation) => (
          <ConversationListItem
            key={conversation.id}
            conversation={conversation}
            // selected={selectedConversationId === conversation.id}
            // onPress={() => onSelectConversation(conversation.id)}
          />
        ))
      ) : (
        <View className="px-4 py-6">
          <Text className="text-muted-foreground">No conversations found.</Text>
        </View>
      )}
    </ScrollView>
  );
}

function ConversationListItem({
  conversation,
  }: {
  conversation: ConversationItem;
  }) {

  // 1. get cid from url
  const router = useRouter();
  const { cid } = useLocalSearchParams<{ cid?: string }>();
  const selected = cid === conversation.id;


  // 2. get conversation info
  const { currentUserInfo, byIds, setIdsList } = useUser(orpc);
  const { markAsRead } = useConversations(orpc);
  const currentUserId = currentUserInfo.user?.id;

  // 3. Build list of participant IDs (excluding current user)
  useEffect(() => {
    setIdsList(
      conversation.participants
        .map((participant) => participant.userId)
        .filter((userId) => userId !== currentUserId)
    );
  }, [conversation.participants, currentUserId, setIdsList]);

  // 4. Extract conv info
  const participants = byIds.users.filter((user) => user.id !== currentUserId);
  const names = participants.map((user) => user.name ?? "Unknown").join(", ") || "Unknown";

  const unreadCount = conversation.unreadCount;
  const lastText = conversation.lastMessage?.text ?? "No messages";
  const timestamp = formatTime(conversation.lastMessage?.createdAt);
  const online = true;  // TODO : use websocket

  return (
    <Pressable
      onPress={() => {
        markAsRead(conversation.id);
        router.setParams({ cid: conversation.id });
      }}
      className={`flex-row items-center gap-3 px-4 py-3 border-b border-border transition-colors ${
        selected ? "bg-primary/10" : "bg-transparent"
      }`}
    >
      {/* Avatar with online indicator */}
      <View className="relative">
        <View className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 items-center justify-center">
          <Text className="text-lg font-semibold text-primary-foreground">{names[0]}</Text>
        </View>
        {online && (
          <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </View>

      {/* Text section */}
      <View className="flex-1 min-w-0">
        <View className="flex-row items-center justify-between">
          {/* Name + Timestamp */}
          <Text className="font-semibold text-foreground" numberOfLines={1}>
            {names}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">{timestamp}</Text>
        </View>

        <View className="flex-row items-center justify-between mt-1">
          {/* Last Message */}
          <Text className="text-sm text-gray-500 dark:text-gray-400 flex-1" numberOfLines={1}>
            {lastText}
          </Text>

          {/* Unread Bubble */}
          {unreadCount > 0 && (
            <View className="ml-2 bg-green-500 px-2 py-1 rounded-full">
              <Text className="text-xs text-white font-semibold">{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// ======= 2. ChatWindow ===========
function ChatWindow({
  children: [chatHeader, chatArea, chatInput],
  }: {
  children: [React.ReactNode, React.ReactNode, React.ReactNode];
  }) {
  return (
    <View className="flex-1 flex-col">
      <View className="shrink-0 border-b border-border">{chatHeader}</View>
      <View className="flex-1 overflow-hidden">{chatArea}</View>
      <View className="shrink-0 border-t border-border">{chatInput}</View>
    </View>
  );
}

function ChatHeader() {
  // TODO: Add recipient info logic here
  return (
    <View className="px-4 py-3 flex-row items-center justify-between">
      <View>
        <Text className="text-foreground font-semibold text-lg">Chat Header</Text>
        <Text className="text-muted-foreground text-sm">Active now</Text>
      </View>

      <View className="flex-row items-center gap-2">
        <Pressable className="p-2">
          <Ionicons name="call-outline" size={20} />
        </Pressable>
        <Pressable className="p-2">
          <Ionicons name="videocam-outline" size={20} />
        </Pressable>
      </View>
    </View>
  );
}

function ChatArea({ cid }: { cid:string | null}) {
  const { currentUserInfo } = useUser(orpc);
  const {listMessages} = useMessages(orpc, cid ?? '');
  const currentUserId = currentUserInfo.user?.id;
  const messages = listMessages.messages;

  // WS
  useConversationStream(orpc, cid ?? null);

  return (
    <ScrollView className="flex-1 px-4 py-4">
      {messages.length > 0 ? (
        messages.map((msg) => {
          const isMine = msg.senderId === currentUserId;

          return (
            <View
              key={msg.id}
              className={`flex mb-3 ${isMine ? "items-end" : "items-start"}`}
            >
              <View
                className={`max-w-xs px-4 py-2 rounded-2xl ${
                  isMine
                    ? "bg-blue-500 text-blue-50 rounded-br-none"
                    : "bg-gray-200 text-gray-900 rounded-bl-none dark:bg-gray-700 dark:text-gray-100"
                }`}
              >
                <Text className={isMine ? "text-blue-50" : "text-gray-900 dark:text-gray-100"}>
                  {msg.text}
                </Text>
                <Text
                  className={`text-xs mt-1 ${
                    isMine ? "text-blue-100" : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {formatTime(msg.updatedAt)}
                </Text>
              </View>
            </View>
          );
        })
      ) : (
        <Text className="text-muted-foreground">No messages yet. Start the conversation!</Text>
      )}
    </ScrollView>
  );
}

function ChatInput({ cid }: { cid: string | null }) {
  const {send, setNewMessage, newMessage} = useMessages(orpc, cid ?? '');  // ? conversationId=cid

  const canSend = newMessage?.trim().length > 0;

  return (
    <View className="px-4 py-3 flex-row items-end gap-2">
      <View className="flex-1">
        <TextField>
          <TextField.Input
            value={newMessage}
            onChangeText={(text: string) => setNewMessage(text)}
            placeholder="Type a message..."
            multiline
            // On native pressing "send" on keyboard could trigger onSubmitEditing.
            // If you want to also send on keyboard submit (single-line), uncomment below:
            // onSubmitEditing={() => { if (canSend) send(); }}
          />
        </TextField>
      </View>

      <Button onPress={() => { if (canSend) send(); }} isDisabled={!canSend}>
        <Button.Label>Send</Button.Label>
      </Button>
    </View>
  );
}

// ======== MAIN APP COMPONENT ========
export default function MessagingMobile() {
  const { searchText, setSearchText, search } = useUser(orpc);
  const { conversations } = useConversations(orpc);
  // const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // cid
  const router = useRouter();
  const { cid } = useLocalSearchParams<{ cid?: string }>();
  const selectedConversationId = cid ?? null;
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      router.setParams({ cid: conversations[0].id });
    }
  }, [selectedConversationId, conversations, router]);


  return (
    <Container className="bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">

        <ChatLayout>
          {/* LEFT */}
          <SideBar>
            <SearchBar searchText={searchText} setSearchText={setSearchText} />
            <ConversationList
              conversations={conversations}
              search={search} // TODO: Add search logic
              searchText={searchText}
              // selectedConversationId={selectedConversationId}
              // onSelectConversation={setSelectedConversationId}
            />
          </SideBar>

          {/* RIGHT */}
          <ChatWindow>
            <ChatHeader />
            <ChatArea cid={selectedConversationId} />
            <ChatInput cid={selectedConversationId} />
          </ChatWindow>

          
        </ChatLayout>

      </KeyboardAvoidingView>
    </Container>
  );
}

















// ----- end