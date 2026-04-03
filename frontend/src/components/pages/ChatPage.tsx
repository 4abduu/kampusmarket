"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  MessageCircle,
  Send,
  MoreVertical,
  Phone,
  Image as ImageIcon,
  CheckCheck,
  Package,
  Flag,
  ArrowLeft,
  ChevronRight,
  Smile,
  X,
  Handshake,
  Receipt,
  User,
  Store,
  ArrowLeftRight,
} from "lucide-react";
import { mockChats, mockProducts } from "@/lib/mock-data";

interface ChatPageProps {
  onNavigate: (page: string, productId?: string) => void;
}

// Simple emoji list
const EMOJIS = ["😀", "😂", "🥰", "😍", "🙏", "👍", "👌", "❤️", "🔥", "⭐", "💰", "📦", "🚀", "✨", "🙌", "😅", "🤔", "😢", "😮", "🎉"];

interface Message {
  id: string;
  senderId: string;
  content: string;
  time: string;
  isMe: boolean;
  type: "text" | "product" | "nego" | "offer";
  product?: typeof mockProducts[0];
  offerPrice?: number;
  imageUrl?: string;
}

interface ChatState {
  [chatId: number]: Message[];
}

export default function ChatPage({ onNavigate }: ChatPageProps) {
  const [selectedChat, setSelectedChat] = useState<typeof mockChats[0] | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showChatList, setShowChatList] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatState>({});
  
  // Modal states
  const [showNegoModal, setShowNegoModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [negoPrice, setNegoPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<typeof mockProducts[0] | null>(null);
  
  // Current user role (in real app, this comes from auth)
  // For demo: toggle this to see different views
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

  // Initialize messages for a chat
  const getInitialMessages = (chatId: number): Message[] => [
    {
      id: "m1",
      senderId: "buyer",
      content: "Halo kak, saya tertarik dengan produk ini",
      time: "14:00",
      isMe: !isSellerView, // If seller view, buyer's message is not "me"
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
      isMe: isSellerView, // If seller view, seller's message is "me"
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
      content: "Deal kak! 👍",
      time: "14:20",
      isMe: !isSellerView,
      type: "text",
    },
  ];

  // Get messages for selected chat
  const messages = selectedChat ? (chatMessages[selectedChat.id] || getInitialMessages(selectedChat.id)) : [];

  // Scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectChat = (chat: typeof mockChats[0]) => {
    setSelectedChat(chat);
    setShowChatList(false);
    setSelectedProduct(mockProducts[0]); // Default product
    if (!chatMessages[chat.id]) {
      setChatMessages(prev => ({
        ...prev,
        [chat.id]: getInitialMessages(chat.id)
      }));
    }
  };

  const handleBackToList = () => {
    setShowChatList(true);
    setSelectedChat(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setAttachedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleSendMessage = () => {
    if (!selectedChat) return;
    if (!newMessage.trim() && !attachedImage) return;

    const newMsg: Message = {
      id: `m${Date.now()}`,
      senderId: isSellerView ? "seller" : "buyer",
      content: newMessage,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
      type: attachedImage ? "image" : "text",
      imageUrl: attachedImage || undefined,
    };

    setChatMessages(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMsg]
    }));

    setNewMessage("");
    setAttachedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Simulate auto-reply
    setTimeout(() => {
      const buyerReplies = [
        "Baik kak, saya cek dulu ya 👍",
        "Siap kak, bentar ya!",
        "Oke kak, ditunggu ya 🙏",
      ];
      const sellerReplies = [
        "Siap kak, mau yang mana?",
        "Masih ada kak, mau ambil dimana?",
        "Bisa kak, ongkir gratis ya!",
      ];
      const replies = isSellerView ? buyerReplies : sellerReplies;
      const replyMsg: Message = {
        id: `m${Date.now() + 1}`,
        senderId: isSellerView ? "buyer" : "seller",
        content: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        isMe: false,
        type: "text",
      };
      setChatMessages(prev => ({
        ...prev,
        [selectedChat.id]: [...(prev[selectedChat.id] || []), replyMsg]
      }));
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Buyer: Ajukan Nego
  const handleSubmitNego = () => {
    if (!selectedChat || !selectedProduct || !negoPrice) return;
    
    const price = parseInt(negoPrice.replace(/\D/g, ""));
    if (isNaN(price) || price <= 0) return;

    const newMsg: Message = {
      id: `m${Date.now()}`,
      senderId: "buyer",
      content: "",
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      isMe: !isSellerView,
      type: "nego",
      product: selectedProduct,
      offerPrice: price,
    };

    setChatMessages(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMsg]
    }));

    setShowNegoModal(false);
    setNegoPrice("");
    
    // Simulate seller reply
    setTimeout(() => {
      const acceptChance = Math.random();
      const replyMsg: Message = {
        id: `m${Date.now() + 1}`,
        senderId: "seller",
        content: acceptChance > 0.5 
          ? `Oke deal! ${formatPrice(price)} bisa ya. Saya buatin invoicenya.` 
          : `Maaf kak, minimal ${formatPrice(price + 20000)} ya.`,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        isMe: isSellerView,
        type: "text",
      };
      setChatMessages(prev => ({
        ...prev,
        [selectedChat.id]: [...(prev[selectedChat.id] || []), replyMsg]
      }));

      // If accepted, seller sends offer
      if (acceptChance > 0.5) {
        setTimeout(() => {
          const offerMsg: Message = {
            id: `m${Date.now() + 2}`,
            senderId: "seller",
            content: "",
            time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
            isMe: isSellerView,
            type: "offer",
            product: selectedProduct,
            offerPrice: price,
          };
          setChatMessages(prev => ({
            ...prev,
            [selectedChat.id]: [...(prev[selectedChat.id] || []), offerMsg]
          }));
        }, 500);
      }
    }, 1500);
  };

  // Seller: Buat Penawaran (Invoice)
  const handleSubmitOffer = () => {
    if (!selectedChat || !selectedProduct || !offerPrice) return;
    
    const price = parseInt(offerPrice.replace(/\D/g, ""));
    if (isNaN(price) || price <= 0) return;

    const newMsg: Message = {
      id: `m${Date.now()}`,
      senderId: "seller",
      content: "",
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      isMe: isSellerView,
      type: "offer",
      product: selectedProduct,
      offerPrice: price,
    };

    setChatMessages(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMsg]
    }));

    setShowOfferModal(false);
    setOfferPrice("");
  };

  const handleAcceptOffer = (message: Message) => {
    if (!selectedChat) return;
    
    const newMsg: Message = {
      id: `m${Date.now()}`,
      senderId: "buyer",
      content: "Saya terima penawaran ini! ✅",
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      isMe: !isSellerView,
      type: "text",
    };

    setChatMessages(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMsg]
    }));
  };

  // Format price input
  const formatPriceInput = (value: string) => {
    const num = value.replace(/\D/g, "");
    if (num === "") return "";
    return parseInt(num).toLocaleString("id-ID");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Role Toggle (Demo Only) */}
        <div className="mb-4 flex items-center justify-end gap-2">
          <span className="text-xs text-muted-foreground">View sebagai:</span>
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg p-1 border">
            <button
              onClick={() => setIsSellerView(false)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                !isSellerView 
                  ? "bg-primary-600 text-white" 
                  : "hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <User className="h-3 w-3 inline mr-1" />
              Buyer
            </button>
            <button
              onClick={() => setIsSellerView(true)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                isSellerView 
                  ? "bg-primary-600 text-white" 
                  : "hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <Store className="h-3 w-3 inline mr-1" />
              Seller
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)]">
          
          {/* Chat List */}
          <Card className={`
            lg:col-span-1 overflow-hidden transition-all duration-300
            ${showChatList ? 'block' : 'hidden lg:block'}
          `}>
            <CardHeader className="border-b p-4">
              <CardTitle className="text-lg">
                {isSellerView ? "Pesan Pembeli" : "Pesan Penjual"}
              </CardTitle>
            </CardHeader>
            <ScrollArea className="h-[calc(100%-70px)]">
              <div className="divide-y">
                {mockChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleSelectChat(chat)}
                    className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                      selectedChat?.id === chat.id ? "bg-primary-50 dark:bg-primary-900/20" : ""
                    }`}
                  >
                    <Avatar className="h-11 w-11 sm:h-12 sm:w-12 shrink-0">
                      <AvatarFallback className="bg-primary-100 text-primary-700 text-sm sm:text-base">
                        {chat.seller.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium truncate text-sm sm:text-base">{chat.seller.name}</p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(chat.lastMessageAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">
                        {chat.lastMessage}
                      </p>
                    </div>
                    {chat.unreadCount > 0 && (
                      <Badge className="bg-primary-600 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Chat Window */}
          <Card className={`
            lg:col-span-2 flex flex-col overflow-hidden transition-all duration-300
            ${!showChatList || selectedChat ? 'flex' : 'hidden lg:flex'}
          `}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden h-8 w-8"
                        onClick={handleBackToList}
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                        <AvatarFallback className="bg-primary-100 text-primary-700 text-xs sm:text-sm">
                          {selectedChat.seller.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">{selectedChat.seller.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="w-2 h-2 bg-primary-500 rounded-full shrink-0" />
                          <span>{isSellerView ? "Pembeli" : "Penjual"} • Online</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <ScrollArea className="flex-1 p-3 sm:p-4">
                  <div className="space-y-3 sm:space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] ${
                            message.isMe
                              ? "bg-primary-600 text-white"
                              : "bg-white dark:bg-slate-800 border"
                          } rounded-2xl px-3 sm:px-4 py-2`}
                        >
                          {/* Product Card in Message */}
                          {message.type === "product" && message.product && (
                            <div 
                              className={`
                                mb-2 rounded-xl overflow-hidden cursor-pointer
                                ${message.isMe ? "bg-white/10" : "bg-slate-50 dark:bg-slate-700"}
                              `}
                              onClick={() => onNavigate("product", message.product.id)}
                            >
                              <div className="flex items-center gap-2 p-2">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center shrink-0">
                                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground/50" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-xs sm:text-sm truncate">
                                    {message.product.title}
                                  </p>
                                  <p className={`font-bold text-xs sm:text-sm ${
                                    message.isMe ? "text-white" : "text-primary-600"
                                  }`}>
                                    {formatPrice(message.product.price)}
                                  </p>
                                </div>
                                <ChevronRight className={`h-4 w-4 shrink-0 ${
                                  message.isMe ? "text-white/70" : "text-muted-foreground"
                                }`} />
                              </div>
                            </div>
                          )}

                          {/* Nego Request (Buyer) */}
                          {message.type === "nego" && message.product && (
                            <div className={`
                              rounded-xl p-3
                              ${message.isMe ? "bg-white/10" : "bg-amber-50 dark:bg-amber-900/30"}
                            `}>
                              <div className="flex items-center gap-2 mb-2 text-xs">
                                <Handshake className="h-4 w-4" />
                                <span className="font-medium">Ajukan Nego</span>
                              </div>
                              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/20">
                                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center shrink-0">
                                  <Package className="h-4 w-4 text-muted-foreground/50" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs truncate">{message.product.title}</p>
                                  <p className={`text-xs line-through ${
                                    message.isMe ? "text-white/60" : "text-muted-foreground"
                                  }`}>
                                    {formatPrice(message.product.price)}
                                  </p>
                                </div>
                              </div>
                              <p className="font-bold text-base sm:text-lg">
                                {formatPrice(message.offerPrice || 0)}
                              </p>
                              <p className="text-xs opacity-70 mt-1">Harga penawaran</p>
                            </div>
                          )}

                          {/* Offer/Invoice (Seller) */}
                          {message.type === "offer" && message.product && (
                            <div className="space-y-2">
                              <div className={`
                                rounded-xl p-3
                                ${message.isMe ? "bg-white/10" : "bg-primary-50 dark:bg-primary-900/30"}
                              `}>
                                <div className="flex items-center gap-2 mb-2 text-xs">
                                  <Receipt className="h-4 w-4" />
                                  <span className="font-medium">Penawaran Khusus</span>
                                </div>
                                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/20">
                                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center shrink-0">
                                    <Package className="h-4 w-4 text-muted-foreground/50" />
                                  </div>
                                  <p className="text-xs truncate">{message.product.title}</p>
                                </div>
                                <p className="font-bold text-base sm:text-lg">
                                  {formatPrice(message.offerPrice || 0)}
                                </p>
                                <p className="text-xs opacity-70 mt-1">Klik bayar untuk terima</p>
                              </div>
                              {/* Accept/Reject buttons for buyer */}
                              {!isSellerView && !message.isMe && (
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    className="flex-1 bg-primary-600 text-white hover:bg-primary-700"
                                    onClick={() => handleAcceptOffer(message)}
                                  >
                                    Terima
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => onNavigate("checkout")}
                                  >
                                    Bayar Sekarang
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Regular Text Message */}
                          {message.type === "text" && message.content && (
                            <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          )}
                          
                          {/* Time & Status */}
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-[10px] sm:text-xs opacity-70">{message.time}</span>
                            {message.isMe && (
                              <CheckCheck className="h-3 w-3 opacity-70" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Image Preview */}
                {attachedImage && (
                  <div className="px-4 py-2 border-t bg-slate-50 dark:bg-slate-800/50">
                    <div className="relative inline-block">
                      <img 
                        src={attachedImage} 
                        alt="Preview" 
                        className="h-20 w-20 object-cover rounded-lg border"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="px-4 py-2 border-t bg-white dark:bg-slate-800">
                    <div className="flex flex-wrap gap-1">
                      {EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleAddEmoji(emoji)}
                          className="h-8 w-8 flex items-center justify-center text-lg hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <div className="border-t p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
                      onClick={() => fileInputRef.current?.click()}
                      title="Kirim gambar"
                    >
                      <ImageIcon className="h-4 w-4 text-slate-500" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      title="Emoji"
                    >
                      <Smile className={`h-4 w-4 ${showEmojiPicker ? 'text-primary-600' : 'text-slate-500'}`} />
                    </Button>
                    <Input
                      placeholder="Ketik pesan..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 text-sm"
                    />
                    <Button 
                      className="bg-primary-600 hover:bg-primary-700 h-8 w-8 sm:h-9 sm:w-9 shrink-0" 
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() && !attachedImage}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Quick Actions - Different for Buyer/Seller */}
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-1 px-1">
                    {/* Buyer Actions */}
                    {!isSellerView && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs sm:text-sm whitespace-nowrap"
                          onClick={() => setShowNegoModal(true)}
                        >
                          <Handshake className="h-3 w-3 mr-1" />
                          Ajukan Nego
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs sm:text-sm whitespace-nowrap ml-auto text-red-500 hover:text-red-600"
                        >
                          <Flag className="h-3 w-3 mr-1" />
                          Laporkan
                        </Button>
                      </>
                    )}
                    
                    {/* Seller Actions */}
                    {isSellerView && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs sm:text-sm whitespace-nowrap"
                          onClick={() => setShowOfferModal(true)}
                        >
                          <Receipt className="h-3 w-3 mr-1" />
                          Buat Penawaran
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs sm:text-sm whitespace-nowrap ml-auto text-red-500 hover:text-red-600"
                        >
                          <Flag className="h-3 w-3 mr-1" />
                          Laporkan
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm sm:text-base">Pilih chat untuk mulai percakapan</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Nego Modal (Buyer) */}
      <Dialog open={showNegoModal} onOpenChange={setShowNegoModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-amber-600" />
              Ajukan Nego
            </DialogTitle>
            <DialogDescription>
              Ajukan penawaran harga ke penjual
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Product Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Pilih Produk</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {mockProducts.slice(0, 3).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                      selectedProduct?.id === product.id 
                        ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20" 
                        : "hover:border-slate-300"
                    }`}
                  >
                    <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.title}</p>
                      <p className="text-xs text-primary-600">{formatPrice(product.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">Harga Penawaran</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                <Input
                  placeholder="0"
                  value={negoPrice}
                  onChange={(e) => setNegoPrice(formatPriceInput(e.target.value))}
                  className="pl-10"
                />
              </div>
              {selectedProduct && (
                <p className="text-xs text-muted-foreground mt-1">
                  Harga asli: {formatPrice(selectedProduct.price)}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowNegoModal(false)}>
                Batal
              </Button>
              <Button 
                className="flex-1 bg-primary-600 hover:bg-primary-700"
                onClick={handleSubmitNego}
                disabled={!selectedProduct || !negoPrice}
              >
                Kirim Penawaran
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Offer Modal (Seller) */}
      <Dialog open={showOfferModal} onOpenChange={setShowOfferModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary-600" />
              Buat Penawaran Khusus
            </DialogTitle>
            <DialogDescription>
              Buat invoice/penawaran khusus untuk pembeli
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Product Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Pilih Produk</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {mockProducts.slice(0, 3).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                      selectedProduct?.id === product.id 
                        ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20" 
                        : "hover:border-slate-300"
                    }`}
                  >
                    <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.title}</p>
                      <p className="text-xs text-primary-600">{formatPrice(product.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">Harga Penawaran</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                <Input
                  placeholder="0"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(formatPriceInput(e.target.value))}
                  className="pl-10"
                />
              </div>
              {selectedProduct && (
                <p className="text-xs text-muted-foreground mt-1">
                  Harga normal: {formatPrice(selectedProduct.price)}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowOfferModal(false)}>
                Batal
              </Button>
              <Button 
                className="flex-1 bg-primary-600 hover:bg-primary-700"
                onClick={handleSubmitOffer}
                disabled={!selectedProduct || !offerPrice}
              >
                Kirim Penawaran
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
