"use client";

import { useEffect, useRef, useState } from "react";
import { mockChats, mockProducts, mockServices, mockUsers, type Chat, type Product } from "@/lib/mock-data";
import ChatRoleToggle from "@/components/pages/user/chat/ChatRoleToggle";
import ChatListPanel from "@/components/pages/user/chat/ChatListPanel";
import ChatConversationPanel from "@/components/pages/user/chat/ChatConversationPanel";
import ChatActionModals from "@/components/pages/user/chat/ChatActionModals";
import type { ChatMessage, ChatState } from "@/components/pages/user/chat/chat.types";

interface ChatPageProps {
  onNavigate: (page: string, productId?: string) => void;
  initialContextId?: string;
  initialChatAction?: "chat" | "nego";
}

export default function ChatPage({ onNavigate, initialContextId, initialChatAction }: ChatPageProps) {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showChatList, setShowChatList] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatState>({});

  const [showNegoModal, setShowNegoModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [negoPrice, setNegoPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isSellerView, setIsSellerView] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getInitialMessages = (): ChatMessage[] => [
    {
      id: "m1",
      senderId: "buyer",
      content: "Halo kak, saya tertarik dengan produk ini",
      time: "14:00",
      isMe: !isSellerView,
      type: "text",
    },
    {
      id: "m2",
      senderId: "buyer",
      content: "",
      time: "14:00",
      isMe: !isSellerView,
      type: "product",
      product: mockProducts[0],
    },
    {
      id: "m3",
      senderId: "seller",
      content: "Halo, masih ada kak. Kondisi masih bagus, sudah dipakai 1 semester aja.",
      time: "14:05",
      isMe: isSellerView,
      type: "text",
    },
    {
      id: "m4",
      senderId: "buyer",
      content: "Bisa nego dikit kak?",
      time: "14:10",
      isMe: !isSellerView,
      type: "text",
    },
    {
      id: "m5",
      senderId: "buyer",
      content: "",
      time: "14:10",
      isMe: !isSellerView,
      type: "nego",
      product: mockProducts[0],
      offerPrice: 150000,
    },
    {
      id: "m6",
      senderId: "seller",
      content: "Hmm, 160rb aja ya. Itu udah paling murah.",
      time: "14:15",
      isMe: isSellerView,
      type: "text",
    },
    {
      id: "m7",
      senderId: "seller",
      content: "",
      time: "14:15",
      isMe: isSellerView,
      type: "offer",
      product: mockProducts[0],
      offerPrice: 160000,
    },
    {
      id: "m8",
      senderId: "buyer",
      content: "Deal kak!",
      time: "14:20",
      isMe: !isSellerView,
      type: "text",
    },
  ];

  const messages = selectedChat ? (chatMessages[selectedChat.id] || getInitialMessages()) : [];
  const lastContextKeyRef = useRef<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!initialContextId) return;

    const contextKey = `${initialContextId}:${initialChatAction || "chat"}`;
    if (lastContextKeyRef.current === contextKey) return;
    lastContextKeyRef.current = contextKey;

    const contextProduct = mockProducts.find((p) => p.id === initialContextId) || null;
    const contextService = mockServices.find((s) => s.id === initialContextId) || null;

    if (!contextProduct && !contextService) return;

    const targetSeller = contextProduct ? contextProduct.seller : contextService?.provider;
    if (!targetSeller) return;

    const matchedChat =
      mockChats.find((chat) => chat.productId === initialContextId) ||
      mockChats.find((chat) => chat.seller.id === targetSeller.id);

    const fallbackChat: Chat = {
      id: `ctx-${initialContextId}`,
      productId: initialContextId,
      product: contextProduct || mockProducts[0],
      seller: targetSeller,
      buyer: mockUsers[0],
      lastMessage: contextProduct
        ? `Halo, saya tertarik dengan ${contextProduct.title}`
        : `Halo, saya tertarik dengan layanan ${contextService?.title}`,
      lastMessageAt: new Date().toISOString(),
      buyerUnread: 0,
      sellerUnread: 0,
      isActive: true,
    };

    const targetChat = matchedChat || fallbackChat;
    setSelectedChat(targetChat);
    setShowChatList(false);
    setSelectedProduct(contextProduct);

    const inquiryTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    setChatMessages((prev) => {
      if (prev[targetChat.id]) {
        return prev;
      }

      if (contextProduct) {
        return {
          ...prev,
          [targetChat.id]: [
            {
              id: `ctx-text-${Date.now()}`,
              senderId: "buyer",
              content: `Halo kak, saya tertarik dengan produk ini.`,
              time: inquiryTime,
              isMe: true,
              type: "text",
            },
            {
              id: `ctx-product-${Date.now() + 1}`,
              senderId: "buyer",
              content: "",
              time: inquiryTime,
              isMe: true,
              type: "product",
              product: contextProduct,
            },
          ],
        };
      }

      return {
        ...prev,
        [targetChat.id]: [
          {
            id: `ctx-service-${Date.now()}`,
            senderId: "buyer",
            content: `Halo kak, saya tertarik dengan layanan ${contextService?.title}. Boleh tanya detailnya?`,
            time: inquiryTime,
            isMe: true,
            type: "text",
          },
        ],
      };
    });

    if (initialChatAction === "nego" && contextProduct?.canNego) {
      setShowNegoModal(true);
    }
  }, [initialContextId, initialChatAction]);

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    setShowChatList(false);
    setSelectedProduct(mockProducts[0]);
    if (!chatMessages[chat.id]) {
      setChatMessages((prev) => ({
        ...prev,
        [chat.id]: getInitialMessages(),
      }));
    }
  };

  const handleBackToList = () => {
    setShowChatList(true);
    setSelectedChat(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setAttachedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleSendMessage = () => {
    if (!selectedChat) return;
    if (!newMessage.trim() && !attachedImage) return;

    const newMsg: ChatMessage = {
      id: `m${Date.now()}`,
      senderId: isSellerView ? "seller" : "buyer",
      content: newMessage,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
      type: attachedImage ? "image" : "text",
      imageUrl: attachedImage || undefined,
    };

    setChatMessages((prev) => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMsg],
    }));

    setNewMessage("");
    setAttachedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setTimeout(() => {
      const buyerReplies = [
        "Baik kak, saya cek dulu ya",
        "Siap kak, bentar ya!",
        "Oke kak, ditunggu ya",
      ];
      const sellerReplies = [
        "Siap kak, mau yang mana?",
        "Masih ada kak, mau ambil dimana?",
        "Bisa kak, ongkir gratis ya!",
      ];
      const replies = isSellerView ? buyerReplies : sellerReplies;
      const replyMsg: ChatMessage = {
        id: `m${Date.now() + 1}`,
        senderId: isSellerView ? "buyer" : "seller",
        content: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        isMe: false,
        type: "text",
      };
      setChatMessages((prev) => ({
        ...prev,
        [selectedChat.id]: [...(prev[selectedChat.id] || []), replyMsg],
      }));
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSubmitNego = () => {
    if (!selectedChat || !selectedProduct || !negoPrice) return;

    const price = parseInt(negoPrice.replace(/\D/g, ""));
    if (isNaN(price) || price <= 0) return;

    const newMsg: ChatMessage = {
      id: `m${Date.now()}`,
      senderId: "buyer",
      content: "",
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      isMe: !isSellerView,
      type: "nego",
      product: selectedProduct,
      offerPrice: price,
    };

    setChatMessages((prev) => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMsg],
    }));

    setShowNegoModal(false);
    setNegoPrice("");

    setTimeout(() => {
      const acceptChance = Math.random();
      const replyMsg: ChatMessage = {
        id: `m${Date.now() + 1}`,
        senderId: "seller",
        content: acceptChance > 0.5
          ? `Oke deal! ${formatPrice(price)} bisa ya. Saya buatin invoicenya.`
          : `Maaf kak, minimal ${formatPrice(price + 20000)} ya.`,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        isMe: isSellerView,
        type: "text",
      };
      setChatMessages((prev) => ({
        ...prev,
        [selectedChat.id]: [...(prev[selectedChat.id] || []), replyMsg],
      }));

      if (acceptChance > 0.5) {
        setTimeout(() => {
          const offerMsg: ChatMessage = {
            id: `m${Date.now() + 2}`,
            senderId: "seller",
            content: "",
            time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
            isMe: isSellerView,
            type: "offer",
            product: selectedProduct,
            offerPrice: price,
          };
          setChatMessages((prev) => ({
            ...prev,
            [selectedChat.id]: [...(prev[selectedChat.id] || []), offerMsg],
          }));
        }, 500);
      }
    }, 1500);
  };

  const handleSubmitOffer = () => {
    if (!selectedChat || !selectedProduct || !offerPrice) return;

    const price = parseInt(offerPrice.replace(/\D/g, ""));
    if (isNaN(price) || price <= 0) return;

    const newMsg: ChatMessage = {
      id: `m${Date.now()}`,
      senderId: "seller",
      content: "",
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      isMe: isSellerView,
      type: "offer",
      product: selectedProduct,
      offerPrice: price,
    };

    setChatMessages((prev) => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMsg],
    }));

    setShowOfferModal(false);
    setOfferPrice("");
  };

  const handleAcceptOffer = () => {
    if (!selectedChat) return;

    const newMsg: ChatMessage = {
      id: `m${Date.now()}`,
      senderId: "buyer",
      content: "Saya terima penawaran ini! ✅",
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      isMe: !isSellerView,
      type: "text",
    };

    setChatMessages((prev) => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMsg],
    }));
  };

  const formatPriceInput = (value: string) => {
    const num = value.replace(/\D/g, "");
    if (num === "") return "";
    return parseInt(num).toLocaleString("id-ID");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <ChatRoleToggle isSellerView={isSellerView} setIsSellerView={setIsSellerView} />

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)]">
          <ChatListPanel
            chats={mockChats}
            selectedChat={selectedChat}
            showChatList={showChatList}
            isSellerView={isSellerView}
            onSelectChat={handleSelectChat}
          />

          <ChatConversationPanel
            selectedChat={selectedChat}
            showChatList={showChatList}
            isSellerView={isSellerView}
            messages={messages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            attachedImage={attachedImage}
            fileInputRef={fileInputRef}
            messagesEndRef={messagesEndRef}
            onNavigate={onNavigate}
            setShowNegoModal={setShowNegoModal}
            setShowOfferModal={setShowOfferModal}
            onBackToList={handleBackToList}
            onHandleImageUpload={handleImageUpload}
            onRemoveImage={handleRemoveImage}
            onAddEmoji={handleAddEmoji}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
            onAcceptOffer={handleAcceptOffer}
            formatPrice={formatPrice}
          />
        </div>
      </div>

      <ChatActionModals
        showNegoModal={showNegoModal}
        setShowNegoModal={setShowNegoModal}
        showOfferModal={showOfferModal}
        setShowOfferModal={setShowOfferModal}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        products={mockProducts}
        negoPrice={negoPrice}
        setNegoPrice={setNegoPrice}
        offerPrice={offerPrice}
        setOfferPrice={setOfferPrice}
        formatPrice={formatPrice}
        formatPriceInput={formatPriceInput}
        handleSubmitNego={handleSubmitNego}
        handleSubmitOffer={handleSubmitOffer}
      />
    </div>
  );
}
