import { useState, useEffect } from 'react';
import { createFileRoute, Link } from "@tanstack/react-router";

// Libs
import z from 'zod';
import { useUser,useMessages, useConversations } from '@my-better-t-app/hooks';
import { orpc } from '@/utils/orpc';
import type { ProcedureUtils } from '@orpc/tanstack-query';
import Header from '@/components/header';

// UI
import { Send, MoreVertical, Search, Phone, Video, Paperclip, Smile } from 'lucide-react';

// Websockets
import { useConversationStream } from "@my-better-t-app/hooks/websocket/useConversationStream";



// Import DB types
// ---> infer them directly from /hooks : ReturnType<typeof useConversations>['conversations'][number]

// ========== Alternative way of importing types =========
// import type { Prisma } from '../../../../packages/db/prisma/generated/client';
// import type { useClientPoint } from 'node_modules/@base-ui/react/esm/floating-ui-react';
// Inherit Types
// type Conversation = Prisma.ConversationGetPayload<{ include:{ participants: true, messages:true } }>
// type Message = Prisma.MessageGetPayload<{ include:{ sender: true, conversation: true } }>
// type ConversationParticipant = Prisma.ConversationParticipantGetPayload<{ include:{ user: true, conversation: true } }>
// type User = Prisma.UserGetPayload<{ include:{ conversations: true, messagesSent: true, sessions: true, accounts: true  } }>

// type Conversation = typeof orpc.conversation.listAll extends ProcedureUtils<any, any, infer OA, any> ? OA extends  (infer O)[] ? O : never : never
// type Message = typeof orpc.message.list extends ProcedureUtils<any, any, infer O, any> ? O extends { messages: any} ? O['messages'][number] : never : never
// type User = typeof orpc.user.current extends ProcedureUtils<any, any, infer O, any> ? O : never


export const Route = createFileRoute("/messaging")({
  component: LiveChatApp,
  validateSearch: z.object({
    cid: z.string().optional(),   // abbrev. for "conversationId".
  })
});


// ChatLayout
//  ├── Sidebar
//  │     ├── Header
//  │     └── ConversationList

//  └── ChatWindow
//        ├── ChatHeader
//        ├── MessagesArea
//        └── ChatInput


// -------- Helpers -----------
export function formatTime(value: Date | string | number | null | undefined) {
  if (!value) return "";

  const date = new Date(value);

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}



// -------- App Layout ---------
function ChatLayout({
    children: [sidebar, chatWindow],
    }: {
    children: [React.ReactNode, React.ReactNode]; // represents anything React can render (<> tags, strings, bools, arrays...)
    }) {
    return (
        <div className="flex h-full overflow-hidden">
          <div className="w-80 border-r flex flex-col h-full">{sidebar}</div>  {/* Auto - scroll available if list long enough. */}
          <div className="flex-1 flex flex-col overflow-hidden">{chatWindow}</div>
        </div>
    );
}

// ======= 1. SideBar ===========
function SideBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-80 border-r flex flex-col h-full">
      {children}
    </div>
  );
}

function SearchBar({
  searchText,
  setSearchText
}: {
  searchText: string;
  setSearchText: (value: string) => void;
}
) {
  // const {searchText, setSearchText} = useUser(orpc)
  return (
    <div className="p-4 border-b">
      <input
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Search..."
        className="w-full px-4 py-2 rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

function ConversationList({
  conversations,
  search,
  searchText,
}: {
  conversations: ReturnType<typeof useConversations>["conversations"];
  search: ReturnType<typeof useUser>["search"];
  searchText: string,
}) {
  // const { conversations } = useConversations(orpc)

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
    <div className="flex-1 overflow-y-auto" role="list">
      {visibleConversations.length > 0 ? (
        visibleConversations.map((cv) => (
          <Link
            key={cv.id}
            to="."
            search={(prev) => ({ ...prev, cid: cv.id })}
          >
            <ConversationListItem
              {...cv} // pass through the ENTIRE conversation as object
            />
          </Link>
        ))
      ) : (
        <div className="p-4 text-sm text-muted-foreground">
          No conversations found.
        </div>
      )}
    </div>
  );
}

function ConversationListItem(
  selectedCv: ReturnType<typeof useConversations>['conversations'][number]
  ) {
  const { cid } = Route.useSearch();  // useParam ? No : cid is a query param, not a url/path param.
  const { markAsRead } = useConversations(orpc);
  const { currentUserInfo, byIds, setIdsList } = useUser(orpc);

  const currentUserId = currentUserInfo.user?.id;

  useEffect(() => {
    setIdsList(
      selectedCv.participants
        .map((participant) => participant.userId)
        .filter((userId) => userId !== currentUserId)
    );
  }, [selectedCv.participants, currentUserId, setIdsList]);

  // Extract
  const participants = byIds.users.filter((user) => user.id !== currentUserId);
  const names = participants.map((user) => user.name ?? "Unknown").join(", ") || "Unknown;"

  const unreadCount = selectedCv.unreadCount;
  const lastText = selectedCv.lastMessage?.text ?? "";
  const timestamp = formatTime(selectedCv.lastMessage?.createdAt);
  const online = true;  // TODO : use websocket

  return (
    <button
      onClick={() => { markAsRead(selectedCv.id); }}

      // className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors 
      className={`w-full flex items-center gap-3 px-4 py-3 border-b border-border transition-colors
        ${cid == selectedCv.id
          ? 'bg-primary text-primary-foreground' 
          : 'bg-sidebar text-sidebar-foreground hover:bg-accent'
      }`}
      aria-label={`Open conversation with ${names}`}
    >
      {/* Avatar */}
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xl">
          {/* {conversation.avatar} */}
        </div>
        {online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>
      {/* Text */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between">
          {/* Name + Timestamp */}
          <span className="font-semibold text-foreground">{names}</span>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        </div>
        <div className="flex items-center justify-between">
          {/* Last Message */}
          <span className="text-sm text-muted-foreground truncate">{lastText}</span>
          {/* Unread Bubble */}
          {unreadCount > 0 && (
            <span className="ml-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}


// ======= 2. ChatWindow ===========
function ChatWindow({ 
    children: [ChatHeader, ChatArea, ChatInput],
    }: {
    children: [React.ReactNode, React.ReactNode, React.ReactNode]; // represents anything React can render (<> tags, strings, bools, arrays...)
    }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Expect children: [ChatHeader, ChatArea, ChatInput] */}
      <div className="shrink-0">
        {ChatHeader}
      </div>

      <div className="flex-1 overflow-y-auto bg-(--chat-background)">
        {ChatArea}
      </div>

      <div className="shrink-0">
        {ChatInput}
      </div>
    </div>
  );
}



function ChatHeader() {
  const { cid } = Route.useSearch();   // get query param `cid` from URL
  const { getById } = useConversations(orpc, cid);
  const { byIds } = useUser(orpc);
  const conversation = getById.data;   // contains conv data (participants, messages, unread counts)

    if (!conversation) return null; //or a loading placeholder

  // Get participants info
  const participantsIds = conversation?.participants ?? [];
  const participants = byIds.users.filter(u => participantsIds.includes(u.id));
  const participantsNames = participants.map(p => p.name ?? "Unknown");

  // Title Format ("Johnny, Sarah and 2 more.")
  let title: String;
  const maxCharLenghtAvailable = 10;   //TODO: get the actual header space available...
  const maxVisible = 3;
  if (participantsNames.length <= maxVisible) title = participantsNames.join(', ');
  else {
    const visibleNames = participantsNames.slice(0, maxVisible).join(', ');
    const remaining = participantsNames.length - maxVisible;
    title = `${visibleNames} & ${remaining} more`
  }
    const online = true; //TODO

  return (
    <div>
      {/* Chat Header */}
    <div className="bg-background border-b border-border p-4 flex items-center justify-between">

      {/* Left Section : Avatar + name + active status */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xl text-primary-foreground">
            {/* {conversation.avatar} */} // TODO
            {participantsNames[0]?.[0] ?? "C."}
          </div>
          {/* Active status */}
          {online && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background"></div>
          )}
        </div>
        {/* Name */}
        <div>
          <h2 className="font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {online ? 'Active now' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Right Section (Call, video Call & Settings) */}
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-accent rounded-full transition-colors">
          <Phone className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-accent rounded-full transition-colors">
          <Video className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-accent rounded-full transition-colors">
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
    </div>
  );
}

function ChatArea() {
  const { cid } = Route.useSearch();
  const { currentUserInfo } = useUser(orpc);
  const {listMessages} = useMessages(orpc, cid ?? '');
  

  const currentUserId = currentUserInfo.user?.id;
  const messages = listMessages.messages;

  // Websocket
  useConversationStream(orpc, cid ?? null);

    return (
    <div className="p-4 space-y-4">
      {/* Messages Area */}
      {messages.map((msg) => {
        const isMine = msg.senderId === currentUserId;

        return (
          <div
            key={msg.id}
            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                isMine
                  // ? 'bg-blue-500 text-bubble-me-foreground rounded-br-none'
                  // : 'bg-white text-gray-900 rounded-bl-none'
                  ? "bg-(--bubble-me) text-(--bubble-me-foreground) rounded-br-none"
                  : "bg-(--bubble-other) text-(--bubble-other-foreground) rounded-bl-none"
              }`}
            >
              <p className="break-words">{msg.text}</p>
              <p className={`text-xs mt-1 ${isMine ? "text-bubble-me-foreground" : "text-gray-500"}`}>
                {formatTime(msg.updatedAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}


function ChatInput() {
  const { cid } = Route.useSearch();
  const {send, setNewMessage, newMessage} = useMessages(orpc, cid ?? '');  // ? conversationId=cid

  
  return (
    <div className="p-4 border-t bg-background flex items-end gap-2">
      <button className="p-2 hover:bg-(--hover) rounded-full transition-colors">
        <Paperclip className="w-5 h-5 text-foreground" />
      </button>
      <div className="flex-1 relative">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Type a message..."
          rows={1}
          className="w-full px-4 py-2 pr-10 bg-input text-foreground rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-hover rounded-full transition-colors">
          <Smile className="w-5 h-5 text-foreground" />
        </button>
      </div>
      <button
        // onClick={handleSendMessage}
        onClick={send}
        disabled={!newMessage.trim()}
        className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
}

// ======== MAIN WEB APP COMPONENT ========
export function LiveChatApp() {
  const { search, searchText, setSearchText } = useUser(orpc);
  const { conversations } = useConversations(orpc);

  return (
      <ChatLayout>
        {/* LEFT */}
        <SideBar>
          <SearchBar
            searchText={searchText}   
            setSearchText={setSearchText}   // Note : must share searchBar text between SearchBar and ConversationList
          />
          <ConversationList
            conversations={conversations}
            search={search}
            searchText={searchText}
          />
        </SideBar>

        {/* RIGHT */}
        <ChatWindow>
          <ChatHeader/>{/* recipients name, picture, active status and conversations settings + call button... */}
          <ChatArea/>{/* List of messages in the conversation */}
          <ChatInput/>{/* Input field to type and send new messages */}
        </ChatWindow>

      </ChatLayout>
  );
}




