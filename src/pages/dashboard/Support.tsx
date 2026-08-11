import { useState, useEffect } from 'react';
import { supabase } from '@/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Plus, Send, Loader2, Info, X } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

interface Ticket {
  id: string;
  subject: string;
  status: string;
  created_at: string;
}

interface TicketMessage {
  id: string;
  sender: string;
  message: string;
  created_at: string;
}

export default function Support() {
  const { session } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [isCreating, setIsCreating] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (activeTicket) {
      fetchMessages(activeTicket.id);
      
      const channel = supabase.channel(`ticket_messages:${activeTicket.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${activeTicket.id}`
        }, (payload) => {
          setMessages(prev => [...prev, payload.new as TicketMessage]);
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeTicket]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      console.error('Error fetching tickets', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages', err);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDescription.trim() || !session?.shopId) return;

    try {
      // Create ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          shop_id: session.shopId,
          subject: newSubject
        })
        .select()
        .single();
        
      if (ticketError) throw ticketError;

      // Add initial message
      const { error: msgError } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticket.id,
          sender: 'shop',
          message: newDescription
        });
        
      if (msgError) throw msgError;

      setNewSubject('');
      setNewDescription('');
      setIsCreating(false);
      fetchTickets();
      setActiveTicket(ticket);
    } catch (err) {
      console.error('Error creating ticket', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeTicket) return;

    const msg = newMessage;
    setNewMessage(''); // optimistic clear
    
    try {
      const { error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: activeTicket.id,
          sender: 'shop',
          message: msg
        });
        
      if (error) throw error;
    } catch (err) {
      console.error('Error sending message', err);
      setNewMessage(msg); // revert on error
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      
      {/* Sidebar: Ticket List */}
      <div className={`w-full md:w-1/3 flex flex-col bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden ${activeTicket ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare size={18} className="text-indigo-400" />
            Support Tickets
          </h2>
          <button
            onClick={() => { setIsCreating(true); setActiveTicket(null); }}
            className="p-1.5 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 rounded-lg transition-colors border border-indigo-500/30"
          >
            <Plus size={18} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {tickets.length === 0 ? (
            <div className="text-center p-8 text-white/40 text-sm">
              No support tickets yet. Click the + button to create one.
            </div>
          ) : (
            tickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => { setActiveTicket(ticket); setIsCreating(false); }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  activeTicket?.id === ticket.id 
                    ? 'bg-indigo-500/10 border-indigo-500/30' 
                    : 'bg-black/20 border-white/5 hover:border-white/10 hover:bg-white/5'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-white truncate pr-2">{ticket.subject}</h3>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                    ticket.status === 'open' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-white/5 text-white/40 border-white/10'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-xs text-white/40 font-mono">{formatDate(ticket.created_at)}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Area: Chat or Create */}
      <div className={`flex-1 flex flex-col bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden ${!activeTicket && !isCreating ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        
        {!activeTicket && !isCreating ? (
          <div className="text-center text-white/40 max-w-sm px-6">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
            <p>Select a ticket from the sidebar or create a new one to chat with Admin Support.</p>
          </div>
        ) : isCreating ? (
          <form onSubmit={handleCreateTicket} className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create New Ticket</h2>
              <button type="button" onClick={() => setIsCreating(false)} className="md:hidden p-2 text-white/50">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
                  placeholder="E.g., Issue with file uploads"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Description</label>
                <textarea
                  required
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  rows={5}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:outline-none resize-none"
                  placeholder="Describe your issue in detail..."
                />
              </div>
            </div>
            
            <div className="mt-auto pt-6 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
              >
                Submit Ticket
              </button>
            </div>
          </form>
        ) : activeTicket ? (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-white/10 bg-black/20 flex items-center gap-3">
              <button onClick={() => setActiveTicket(null)} className="md:hidden p-1.5 text-white/50 hover:bg-white/10 rounded-lg">
                <X size={20} />
              </button>
              <div>
                <h2 className="font-bold text-white leading-tight">{activeTicket.subject}</h2>
                <div className="text-xs text-white/50 font-mono mt-0.5">Ticket ID: {activeTicket.id.split('-')[0]}</div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'shop' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.sender === 'shop'
                      ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-50 rounded-tr-sm'
                      : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-sm'
                  }`}>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-50">
                      {msg.sender === 'shop' ? 'You' : 'Admin Support'}
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                    <div className="text-[10px] font-mono mt-2 opacity-40 text-right">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-white/10 bg-black/20">
              {activeTicket.status === 'closed' ? (
                <div className="text-center p-3 text-white/40 text-sm bg-white/5 rounded-xl flex items-center justify-center gap-2 border border-white/5">
                  <Info size={16} />
                  This ticket has been closed by an administrator.
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-500 text-white rounded-xl transition-colors shrink-0"
                  >
                    <Send size={20} />
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
