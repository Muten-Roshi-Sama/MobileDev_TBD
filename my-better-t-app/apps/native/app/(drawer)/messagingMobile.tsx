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
  selectedConversationId,
  onSelectConversation,
  }: {
  conversations: ConversationItem[];
  search: ReturnType<typeof useUser>["search"];
  searchText: string;
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
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
            selected={selectedConversationId === conversation.id}
            onPress={() => onSelectConversation(conversation.id)}
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
  selected,
  onPress,
  }: {
  conversation: ConversationItem;
  selected: boolean;
  onPress: () => void;
  }) {
  // TODO: Add user name logic here later
  const names = "User Name"; // Placeholder
  const lastText = conversation.lastMessage?.text ?? "No messages";
  const timestamp = formatTime(conversation.lastMessage?.createdAt);

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-3 px-4 py-3 border-b border-border ${
        selected ? "bg-primary/10" : "bg-transparent"
      }`}
    >
      <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
        <Text className="text-primary-foreground font-semibold">{names[0]}</Text>
      </View>

      <View className="flex-1 min-w-0">
        <View className="flex-row items-center justify-between">
          <Text className="font-semibold text-foreground" numberOfLines={1}>
            {names}
          </Text>
          <Text className="text-xs text-muted-foreground">{timestamp}</Text>
        </View>

        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-sm text-muted-foreground flex-1" numberOfLines={1}>
            {lastText}
          </Text>

          {conversation.unreadCount > 0 ? (
            <View className="ml-2 bg-green-500 px-2 py-1 rounded-full">
              <Text className="text-xs text-white font-semibold">{conversation.unreadCount}</Text>
            </View>
          ) : null}
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

function ChatArea() {
  // TODO: Add message list logic here
  return (
    <ScrollView className="flex-1 px-4 py-4">
      <Text className="text-muted-foreground">Messages will appear here</Text>
    </ScrollView>
  );
}

function ChatInput() {
  const [message, setMessage] = useState("");

  return (
    <View className="px-4 py-3 flex-row items-end gap-2">
      <View className="flex-1">
        <TextField>
          <TextField.Input
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            multiline
          />
        </TextField>
      </View>

      <Button onPress={() => setMessage("")} isDisabled={!message.trim()}>
        <Button.Label>Send</Button.Label>
      </Button>
    </View>
  );
}

// ======== MAIN APP COMPONENT ========
export default function MessagingMobile() {
  const { searchText, setSearchText, search } = useUser(orpc);
  const { conversations } = useConversations(orpc);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  return (
    <Container className="bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ChatLayout>
          {/* LEFT */}
          <SideBar>
            <SearchBar searchText={searchText} setSearchText={setSearchText} />
            <ConversationList
              conversations={conversations}
              search={search} // TODO: Add search logic
              searchText={searchText}
              selectedConversationId={selectedConversationId}
              onSelectConversation={setSelectedConversationId}
            />
          </SideBar>

          {/* RIGHT */}
          <ChatWindow>
            <ChatHeader />
            <ChatArea />
            <ChatInput />
          </ChatWindow>
        </ChatLayout>
      </KeyboardAvoidingView>
    </Container>
  );
}

















// ----- end