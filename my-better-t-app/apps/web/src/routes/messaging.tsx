import { useState } from 'react';
import { Send, MoreVertical, Search, Phone, Video, Paperclip, Smile } from 'lucide-react';

import { createFileRoute, Link } from "@tanstack/react-router";
import Header from '@/components/header';
import z from 'zod';


interface Message {
  id: number;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
}

interface Conversation {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

export const Route = createFileRoute("/messaging")({
  component: LiveChatApp,
  validateSearch: z.object({
    selectedConversation: z.coerce.number().default(1),
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

type SearchBarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
};
function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  return (
    <div className="p-4 border-b">
      <input
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search..."
        className="w-full px-4 py-2 rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"

      />
    </div>
  );
}

type ConversationListProps = {
  conversations: Conversation[];
  selectedConversation: number;
  onSelectConversation: (id: number) => void;
};
function ConversationList({
  conversations,
  // onSelectConversation,
}: ConversationListProps) {
  const { selectedConversation } = Route.useSearch()
  return (
    <div className="flex-1 overflow-y-auto" role="list">
      {conversations.map((conversation) => (
        <Link to="." search={(prev) => ({ ...prev, selectedConversation: conversation.id })} key={conversation.id}>
        <ConversationListItem
          key={conversation.id}
          conversation={conversation}
          selected={selectedConversation === conversation.id}
          // onClick={() => onSelectConversation(conversation.id)}
          onClick={() => {}}
        />
        </Link>
      ))}
    </div>
  );
}

function ConversationListItem({
  conversation,
  selected,
  onClick,
}: {
  conversation: Conversation;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      // className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors 
      className={`w-full flex items-center gap-3 px-4 py-3 border-b border-border transition-colors
        ${selected 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-sidebar text-sidebar-foreground hover:bg-accent'
      }`}
      aria-label={`Open conversation with ${conversation.name}`}
    >
      {/* Avatar */}
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xl">
          {conversation.avatar}
        </div>
        {conversation.online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>
      {/* Text */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between">
          {/* Name + Timestamp */}
          <span className="font-semibold text-foreground">{conversation.name}</span>
          <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
        </div>
        <div className="flex items-center justify-between">
          {/* Last Message */}
          <span className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</span>
          {/* Unread Bubble */}
          {conversation.unread > 0 && (
            <span className="ml-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {conversation.unread}
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



function ChatHeader({ conversation }: { conversation: Conversation }) {
  return (
    <div>
      {/* Chat Header */}
    <div className="bg-background border-b border-border p-4 flex items-center justify-between">

      {/* Left Section : (Avatar, name, active status) */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xl text-primary-foreground">
            {conversation.avatar}
          </div>
          {/* Active status */}
          {conversation.online && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background"></div>
          )}
        </div>
        {/* Name */}
        <div>
          <h2 className="font-semibold text-foreground">{conversation.name}</h2>
          <p className="text-sm text-muted-foreground">
            {conversation.online ? 'Active now' : 'Offline'}
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

function ChatArea({ messages }: { messages: Message[] }) {
  return (
      <div className="p-4 space-y-4">
        {/* Messages Area */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                msg.sender === 'me'
                  // ? 'bg-blue-500 text-bubble-me-foreground rounded-br-none'
                  // : 'bg-white text-gray-900 rounded-bl-none'
                  ? 'bg-(--bubble-me) text-(--bubble-me-foreground) rounded-br-none'
                  : 'bg-(--bubble-other) text-(--bubble-other-foreground) rounded-bl-none'
              }`}
            >
              <p className="break-words">{msg.text}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.sender === 'me' ? 'text-bubble-me-foreground' : 'text-gray-500'
                }`}
              >
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>
  );
}
function ChatInput({
  messageInput,
  setMessageInput,
  handleSendMessage,
}: {
  messageInput: string;
  setMessageInput: (value: string) => void;
  handleSendMessage: () => void;
}) {
  return (
    <div className="p-4 border-t bg-[var(--background)] flex items-end gap-2">
      <button className="p-2 hover:bg-[var(--hover)] rounded-full transition-colors">
        <Paperclip className="w-5 h-5 text-[var(--foreground)]" />
      </button>
      <div className="flex-1 relative">
        <textarea
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
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
        onClick={handleSendMessage}
        disabled={!messageInput.trim()}
        className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
}

// ======== MAIN APP COMPONENT ========
export function LiveChatApp() {
  // const [selectedConversation, setSelectedConversation] = useState<number>(1);
  const { selectedConversation } = Route.useSearch();
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const conversations: Conversation[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: '👩',
      lastMessage: 'Hey! How are you doing?',
      timestamp: '2m ago',
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: 'Mike Chen',
      avatar: '👨',
      lastMessage: 'Thanks for the update!',
      timestamp: '1h ago',
      unread: 0,
      online: true,
    },
    {
      id: 3,
      name: 'Emily Davis',
      avatar: '👩‍🦰',
      lastMessage: 'See you tomorrow',
      timestamp: '3h ago',
      unread: 0,
      online: false,
    },
    {
      id: 4,
      name: 'Alex Rivera',
      avatar: '🧑',
      lastMessage: 'Can you send me the files?',
      timestamp: '1d ago',
      unread: 1,
      online: false,
    },
    {
      id: 5,
      name: 'Jessica Lee',
      avatar: '👩‍💼',
      lastMessage: 'Perfect! Talk soon.',
      timestamp: '2d ago',
      unread: 0,
      online: true,
    },
    {
      id: 6,
      name: 'Jonas Kraszinski',
      avatar: '🧑',
      lastMessage: 'Perfect! Talk soon.',
      timestamp: '2d ago',
      unread: 0,
      online: true,
    },
    {
      id: 7,
      name: 'Karim Benzema',
      avatar: '👩‍💼',
      lastMessage: 'Perfect! Talk soon.',
      timestamp: '2d ago',
      unread: 0,
      online: true,
    },
    {
      id: 8,
      name: 'Kylian George ',
      avatar: '👩‍💼',
      lastMessage: 'Perfect! Talk soon.',
      timestamp: '2d ago',
      unread: 0,
      online: true,
    },
    {
      id: 9,
      name: 'Andre Kandinski',
      avatar: '👩‍💼',
      lastMessage: 'Perfect! Talk soon.',
      timestamp: '2d ago',
      unread: 0,
      online: true,
    },
    {
      id: 10,
      name: 'Andre Kandinski',
      avatar: '👩‍💼',
      lastMessage: 'Perfect! Talk soon.',
      timestamp: '2d ago',
      unread: 0,
      online: true,
    },
    {
      id: 11,
      name: 'Andre Kandinski',
      avatar: '👩‍💼',
      lastMessage: 'Perfect! Talk soon.',
      timestamp: '2d ago',
      unread: 0,
      online: true,
    },
  ];

  const messages: Record<number, Message[]> = {
    1: [
      { id: 1, text: 'Hey there!', sender: 'other', timestamp: '10:30 AM' },
      { id: 2, text: 'Hi! How can I help you?', sender: 'me', timestamp: '10:31 AM' },
      { id: 3, text: 'I wanted to ask about the project', sender: 'other', timestamp: '10:32 AM' },
      { id: 4, text: 'Sure, what would you like to know?', sender: 'me', timestamp: '10:33 AM' },
      { id: 5, text: 'When is the deadline?', sender: 'other', timestamp: '10:34 AM' },
      { id: 6, text: 'The deadline is next Friday', sender: 'me', timestamp: '10:35 AM' },
      { id: 7, text: 'Hey! How are you doing?', sender: 'other', timestamp: '10:36 AM' },
      { id: 8, text: 'Hey! How are you doing?', sender: 'other', timestamp: '10:36 AM' },
      { id: 9, text: 'Hey! How are you doing?', sender: 'other', timestamp: '10:36 AM' },
      { id: 10, text: 'Hey! How are you doing?', sender: 'other', timestamp: '10:36 AM' },
      { id: 11, text: 'Hey! How are you doing?', sender: 'other', timestamp: '10:36 AM' },
      { id: 12, text: 'Hey! How are you doing?', sender: 'other', timestamp: '10:36 AM' },
    ],
    2: [
      { id: 1, text: 'Thanks for the update!', sender: 'other', timestamp: '9:15 AM' },
      { id: 2, text: 'No problem!', sender: 'me', timestamp: '9:16 AM' },
    ],
    3: [
      { id: 1, text: 'See you tomorrow', sender: 'other', timestamp: 'Yesterday' },
    ],
    4: [
      { id: 1, text: 'Can you send me the files?', sender: 'other', timestamp: 'Yesterday' },
    ],
    5: [
      { id: 1, text: 'Perfect! Talk soon.', sender: 'other', timestamp: '2 days ago' },
    ],
  };

  const currentConversation = conversations.find((c) => c.id === selectedConversation);
  const currentMessages = messages[selectedConversation] || [];

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Handle sending message (mock functionality)
      setMessageInput('');
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
      <ChatLayout>
        {/* LEFT */}
        <SideBar>
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <ConversationList
            conversations={filteredConversations}
            selectedConversation={selectedConversation}
            onSelectConversation={() => {}}//{setSelectedConversation}
          />
        </SideBar>

        {/* RIGHT */}
        <ChatWindow>
          <ChatHeader conversation={currentConversation!} />{/* recipients name, picture, active status and conversations settings + call button... */}
          <ChatArea messages={currentMessages} />{/* List of messages in the conversation */}
          <ChatInput messageInput={messageInput} setMessageInput={setMessageInput} handleSendMessage={handleSendMessage} />{/* Input field to type and send new messages */}
        </ChatWindow>

      </ChatLayout>
  );
}




export function _MessagingApp() {
  const [selectedConversation, setSelectedConversation] = useState<number>(1);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const conversations: Conversation[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: '👩',
      lastMessage: 'Hey! How are you doing?',
      timestamp: '2m ago',
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: 'Mike Chen',
      avatar: '👨',
      lastMessage: 'Thanks for the update!',
      timestamp: '1h ago',
      unread: 0,
      online: true,
    },
    {
      id: 3,
      name: 'Emily Davis',
      avatar: '👩‍🦰',
      lastMessage: 'See you tomorrow',
      timestamp: '3h ago',
      unread: 0,
      online: false,
    },
    {
      id: 4,
      name: 'Alex Rivera',
      avatar: '🧑',
      lastMessage: 'Can you send me the files?',
      timestamp: '1d ago',
      unread: 1,
      online: false,
    },
    {
      id: 5,
      name: 'Jessica Lee',
      avatar: '👩‍💼',
      lastMessage: 'Perfect! Talk soon.',
      timestamp: '2d ago',
      unread: 0,
      online: true,
    },
  ];

  const messages: Record<number, Message[]> = {
    1: [
      { id: 1, text: 'Hey there!', sender: 'other', timestamp: '10:30 AM' },
      { id: 2, text: 'Hi! How can I help you?', sender: 'me', timestamp: '10:31 AM' },
      { id: 3, text: 'I wanted to ask about the project', sender: 'other', timestamp: '10:32 AM' },
      { id: 4, text: 'Sure, what would you like to know?', sender: 'me', timestamp: '10:33 AM' },
      { id: 5, text: 'When is the deadline?', sender: 'other', timestamp: '10:34 AM' },
      { id: 6, text: 'The deadline is next Friday', sender: 'me', timestamp: '10:35 AM' },
      { id: 7, text: 'Hey! How are you doing?', sender: 'other', timestamp: '10:36 AM' },
    ],
    2: [
      { id: 1, text: 'Thanks for the update!', sender: 'other', timestamp: '9:15 AM' },
      { id: 2, text: 'No problem!', sender: 'me', timestamp: '9:16 AM' },
    ],
    3: [
      { id: 1, text: 'See you tomorrow', sender: 'other', timestamp: 'Yesterday' },
    ],
    4: [
      { id: 1, text: 'Can you send me the files?', sender: 'other', timestamp: 'Yesterday' },
    ],
    5: [
      { id: 1, text: 'Perfect! Talk soon.', sender: 'other', timestamp: '2 days ago' },
    ],
  };

  const currentConversation = conversations.find((c) => c.id === selectedConversation);
  const currentMessages = messages[selectedConversation] || [];

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Handle sending message (mock functionality)
      setMessageInput('');
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation.id)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                selectedConversation === conversation.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl">
                  {conversation.avatar}
                </div>
                {conversation.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900">{conversation.name}</h3>
                  <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                  {conversation.unread > 0 && (
                    <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {conversation.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xl">
                    {currentConversation.avatar}
                  </div>
                  {currentConversation.online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{currentConversation.name}</h2>
                  <p className="text-sm text-gray-500">
                    {currentConversation.online ? 'Active now' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Video className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.sender === 'me'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-white text-gray-900 rounded-bl-none'
                    }`}
                  >
                    <p className="break-words">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-end gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full px-4 py-2 pr-10 bg-gray-100 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors">
                    <Smile className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}



