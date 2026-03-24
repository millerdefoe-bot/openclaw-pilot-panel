import { useState, useRef } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Send, Paperclip, X, Shield, GraduationCap, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  files?: { name: string; size: string }[];
  timestamp: Date;
}

const agentConfig = {
  security: {
    name: "Security Agent",
    icon: Shield,
    greeting: "I'm your Security Agent. I can help analyze threats, review access logs, and enforce security policies. How can I assist you?",
    placeholder: "Ask about security threats, policies...",
  },
  teacher: {
    name: "Teacher Agent",
    icon: GraduationCap,
    greeting: "I'm your Teacher Agent. I can help with training materials, onboarding guides, and educational resources. What would you like to learn?",
    placeholder: "Ask about commands, features, guides...",
  },
};

const AgentChat = () => {
  const { agentId } = useParams<{ agentId: string }>();

  if (!agentId || !(agentId in agentConfig)) {
    return <Navigate to="/agents/security" replace />;
  }

  const agent = agentConfig[agentId as keyof typeof agentConfig];
  const AgentIcon = agent.icon;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "greeting",
      role: "assistant",
      content: agent.greeting,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!input.trim() && attachedFiles.length === 0) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      files: attachedFiles.map((f) => ({
        name: f.name,
        size: `${(f.size / 1024).toFixed(1)}KB`,
      })),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttachedFiles([]);

    // Simulate response
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Processing your request. This is a simulated response from the ${agent.name}.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 800);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] bg-grid">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center glow-primary">
          <AgentIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">{agent.name}</h2>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Online</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-success glow-dot animate-pulse-glow" />
          <span className="text-[10px] text-success font-mono">Active</span>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "bg-primary/20 text-foreground border border-primary/30"
                      : "bg-card border border-border text-foreground"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-1.5">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                      <span className="text-[10px] text-primary font-mono font-semibold uppercase">{agent.name}</span>
                    </div>
                  )}
                  <p className="leading-relaxed">{msg.content}</p>
                  {msg.files && msg.files.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.files.map((f, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[10px] font-mono bg-secondary/50 px-2 py-0.5 rounded border border-border"
                        >
                          <Paperclip className="h-2.5 w-2.5" />
                          {f.name} ({f.size})
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="block text-[9px] text-muted-foreground font-mono mt-1.5">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border bg-card/80 backdrop-blur-sm p-4">
        <div className="max-w-3xl mx-auto">
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachedFiles.map((f, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 text-xs font-mono bg-secondary px-2.5 py-1 rounded-md border border-border"
                >
                  <Paperclip className="h-3 w-3 text-primary" />
                  {f.name}
                  <button onClick={() => removeFile(i)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={agent.placeholder}
              rows={1}
              className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <Button
              size="icon"
              className="shrink-0"
              onClick={handleSend}
              disabled={!input.trim() && attachedFiles.length === 0}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentChat;
