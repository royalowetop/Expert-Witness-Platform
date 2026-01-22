import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  subject: string;
  content: string;
  read: boolean;
  created_at: string;
  sender_profile?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export default function MessagesTab() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [newMessage, setNewMessage] = useState({
    receiverEmail: '',
    subject: '',
    content: '',
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const messagesWithProfiles = await Promise.all(
          data.map(async (msg) => {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('full_name, avatar_url')
              .eq('user_id', msg.sender_id)
              .maybeSingle();

            return {
              ...msg,
              sender_profile: profile || { full_name: 'Unknown User', avatar_url: null }
            };
          })
        );

        setMessages(messagesWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev =>
        prev.map(m => m.id === messageId ? { ...m, read: true } : m)
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (!message.read) {
      markAsRead(message.id);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.receiverEmail || !newMessage.subject || !newMessage.content) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: receiverData } = await supabase
        .from('user_profiles')
        .select('user_id')
        .ilike('full_name', `%${newMessage.receiverEmail}%`)
        .maybeSingle();

      if (!receiverData) {
        alert('User not found');
        return;
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverData.user_id,
          subject: newMessage.subject,
          content: newMessage.content,
        });

      if (error) throw error;

      setShowCompose(false);
      setNewMessage({ receiverEmail: '', subject: '', content: '' });
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return created.toLocaleDateString();
  };

  if (showCompose) {
    return (
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-subtle">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-serif font-bold text-brand-navy">Compose Message</h2>
            <button
              onClick={() => setShowCompose(false)}
              className="text-brand-slate hover:text-brand-navy"
            >
              <i className="fa-solid fa-times text-xl"></i>
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-brand-charcoal mb-2">To (Name or Email)</label>
              <input
                type="text"
                value={newMessage.receiverEmail}
                onChange={(e) => setNewMessage({ ...newMessage, receiverEmail: e.target.value })}
                placeholder="Enter recipient name"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-brand-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-charcoal mb-2">Subject</label>
              <input
                type="text"
                value={newMessage.subject}
                onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                placeholder="Message subject"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-brand-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-charcoal mb-2">Message</label>
              <textarea
                value={newMessage.content}
                onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                placeholder="Write your message..."
                rows={10}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-brand-gold focus:outline-none resize-none"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCompose(false)}
                className="px-6 py-2 border border-gray-300 text-brand-charcoal rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                className="px-6 py-2 bg-brand-gold text-white rounded-lg hover:bg-brand-gold-light transition-colors"
              >
                <i className="fa-solid fa-paper-plane mr-2"></i>Send Message
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-navy">Messages</h1>
          <p className="mt-1 text-brand-slate">Communicate with expert witnesses</p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="px-6 py-2 bg-brand-gold text-white rounded-lg hover:bg-brand-gold-light transition-colors"
        >
          <i className="fa-solid fa-plus mr-2"></i>New Message
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 bg-white rounded-xl shadow-subtle">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-brand-navy">Inbox</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-brand-slate">
                <i className="fa-solid fa-spinner fa-spin text-2xl"></i>
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-brand-slate">
                <i className="fa-solid fa-inbox text-3xl mb-2"></i>
                <p className="text-sm">No messages yet</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleMessageClick(message)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !message.read ? 'bg-blue-50' : ''
                  } ${selectedMessage?.id === message.id ? 'bg-brand-gray-light' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-gold text-white flex items-center justify-center font-semibold">
                      {message.sender_profile?.full_name.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className={`text-sm ${!message.read ? 'font-bold' : 'font-semibold'} text-brand-navy truncate`}>
                          {message.sender_profile?.full_name || 'Unknown'}
                        </p>
                        {!message.read && (
                          <span className="flex-shrink-0 w-2 h-2 bg-brand-gold rounded-full ml-2 mt-1"></span>
                        )}
                      </div>
                      <p className="text-sm text-brand-charcoal truncate">{message.subject}</p>
                      <p className="text-xs text-brand-slate mt-1">{formatTimeAgo(message.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="col-span-2 bg-white rounded-xl shadow-subtle">
          {selectedMessage ? (
            <>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-brand-gold text-white flex items-center justify-center font-semibold text-lg">
                    {selectedMessage.sender_profile?.full_name.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-brand-navy">{selectedMessage.subject}</h3>
                    <p className="text-sm text-brand-slate mt-1">
                      From: {selectedMessage.sender_profile?.full_name || 'Unknown'} • {new Date(selectedMessage.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-brand-charcoal whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>
              <div className="p-6 border-t border-gray-200">
                <button className="px-6 py-2 bg-brand-gold text-white rounded-lg hover:bg-brand-gold-light transition-colors">
                  <i className="fa-solid fa-reply mr-2"></i>Reply
                </button>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-brand-slate">
              <i className="fa-solid fa-envelope-open text-6xl mb-4"></i>
              <p>Select a message to view</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
