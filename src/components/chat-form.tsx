'use client';

import { cn } from '@/lib/utils';
import { useChat } from 'ai/react';
import { ArrowUpIcon, Clipboard, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AutoResizeTextarea } from '@/components/autoresize-textarea';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';

const MODELS = [
  'llama3.3',
  'llama3.2',
  'llama3.2:1b',
  'llama2-uncensored',
  'mistral',
  'deepseek-r1:1.5b',
  'deepseek-r1:8b',
  'deepseek-r1:70b',
];

export function ChatForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const [selectedModel, setSelectedModel] = useState('llama3.2:1b');

  const { messages, input, setInput, append } = useChat({
    api: '/api/chat',
    body: { model: selectedModel },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    void append({ content: input, role: 'user' });
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const CodeBlock = ({
    language,
    children,
  }: {
    language: string;
    children: string;
  }) => {
    const [copied, setCopied] = useState(false);

    const copyCode = () => {
      navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="relative rounded-md">
        <SyntaxHighlighter
          style={oneLight}
          language={language}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: '1rem',
            backgroundColor: 'rgb(250, 250, 250)',
          }}
        >
          {children}
        </SyntaxHighlighter>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2 h-6 w-6 text-foreground/60"
              onClick={copyCode}
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Clipboard className="h-3 w-3" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copied ? 'Copied!' : 'Copy code'}</TooltipContent>
        </Tooltip>
      </div>
    );
  };

  const header = (
    <header className="m-auto flex max-w-96 flex-col gap-5 text-center">
      <h1 className="text-2xl font-semibold leading-none tracking-tight">
        xdchat
      </h1>
      <p className="text-muted-foreground text-sm">
        This is an offline AI chatbot app built with{' '}
        <span className="text-foreground">Next.js</span> for studying purposes.
      </p>
      <p className="text-muted-foreground text-sm">
        You must install local models using Ollama to use this chatbot.
      </p>
    </header>
  );

  const messageList = (
    <div className="my-4 flex h-fit min-h-full flex-col gap-4">
      {messages.map((message, index) => (
        <div
          key={index}
          data-role={message.role}
          className="max-w-[80%] relative rounded-xl px-3 py-2 text-sm data-[role=assistant]:self-start data-[role=user]:self-end data-[role=assistant]:bg-gray-100 data-[role=user]:bg-blue-500 data-[role=assistant]:text-black data-[role=user]:text-white"
        >
          <ReactMarkdown
            components={{
              code({ className, children }) {
                const match = /language-(\w+)/.exec(className || '');
                return (
                  <div className="my-2">
                    {match ? (
                      <CodeBlock language={match[1]}>
                        {String(children).replace(/\n$/, '')}
                      </CodeBlock>
                    ) : (
                      <code className={className}>{children}</code>
                    )}
                  </div>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
          {/* <div className="flex justify-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    'mt-2',
                    message.role === 'user' ? 'hidden' : 'flex'
                  )}
                  onClick={() => copyToClipboard(message.content)}
                >
                  {copied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Clipboard className="h-3 w-3" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {copied ? 'Copied!' : 'Copy message'}
              </TooltipContent>
            </Tooltip>
          </div> */}
        </div>
      ))}
    </div>
  );

  return (
    <main
      className={cn(
        'ring-none mx-auto flex h-svh max-h-svh w-full max-w-4xl flex-col items-stretch border-none',
        className
      )}
      {...props}
    >
      <div className="flex-1 content-center overflow-y-auto px-6">
        {messages.length ? messageList : header}
      </div>
      <form
        onSubmit={handleSubmit}
        className="border-input bg-background focus-within:ring-ring/10 relative mx-6 mb-2 flex items-center justify-between rounded-[17px] border px-3 py-1.5 min-h-9 text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-0"
      >
        <AutoResizeTextarea
          onKeyDown={handleKeyDown}
          onChange={(v) => setInput(v)}
          value={input}
          placeholder="Enter a message"
          className="placeholder:text-muted-foreground flex-1 bg-transparent focus:outline-none"
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              type="submit"
              className="size-6 rounded-full"
            >
              <ArrowUpIcon size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={12}>Submit</TooltipContent>
        </Tooltip>
      </form>
      <div className="mx-6 mb-6">
        <Select onValueChange={setSelectedModel} value={selectedModel}>
          <SelectTrigger className="rounded-[17px] px-3 py-1.5 h-9 truncate max-w-[140px]">
            {selectedModel}
          </SelectTrigger>
          <SelectContent>
            {MODELS.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </main>
  );
}
