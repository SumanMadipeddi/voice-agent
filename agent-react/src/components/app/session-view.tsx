
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { AppConfig } from '@/app-config';
import { ChatTranscript } from '@/components/app/chat-transcript';
import { PreConnectMessage } from '@/components/app/preconnect-message';
import { TileLayout } from '@/components/app/tile-layout';
import {
  AgentControlBar,
  type ControlBarControls,
} from '@/components/livekit/agent-control-bar/agent-control-bar';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useConnectionTimeout } from '@/hooks/useConnectionTimout';
import { useDebugMode } from '@/hooks/useDebug';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../livekit/scroll-area/scroll-area';

const MotionBottom = motion.create('div');

const IN_DEVELOPMENT = import.meta.env.DEV;
const BOTTOM_VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
      translateY: '0%',
    },
    hidden: {
      opacity: 0,
      translateY: '100%',
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.3,
    delay: 0.5,
    ease: 'easeOut',
  },
};

interface FadeProps {
  top?: boolean;
  bottom?: boolean;
  className?: string;
}

export function Fade({ top = false, bottom = false, className }: FadeProps) {
  return (
    <div
      className={cn(
        'from-background pointer-events-none h-4 bg-linear-to-b to-transparent',
        top && 'bg-linear-to-b',
        bottom && 'bg-linear-to-t',
        className
      )}
    />
  );
}
interface SessionViewProps {
  appConfig: AppConfig;
}

export const SessionView = ({
  appConfig,
  ...props
}: React.ComponentProps<'section'> & SessionViewProps) => {
  useConnectionTimeout(200_000);
  useDebugMode({ enabled: IN_DEVELOPMENT });

  const messages = useChatMessages();
  const [chatOpen, setChatOpen] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const controls: ControlBarControls = {
    leave: true,
    microphone: true,
    chat: appConfig.supportsChatInput,
    camera: appConfig.supportsVideoInput,
    screenShare: appConfig.supportsVideoInput,
  };

  useEffect(() => {
    // Auto-scroll to bottom only if user is near the bottom or hasn't scrolled up
    // Scroll synchronously for instant updates without delay
    if (scrollAreaRef.current && transcriptOpen && shouldAutoScroll) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, transcriptOpen, shouldAutoScroll]);

  useEffect(() => {
    const element = scrollAreaRef.current;
    if (!element) return;
    const handleScroll = () => {
      const threshold = 48; // px
      const isNearBottom =
        element.scrollTop + element.clientHeight >= element.scrollHeight - threshold;
      setShouldAutoScroll(isNearBottom);
    };
    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, [transcriptOpen]);

  return (
    <section className="bg-background relative z-10 h-full w-full overflow-hidden" {...props}>
      {/* Chat Transcript - Overlay on top of voice wave */}
      <div
        className={cn(
          'fixed inset-x-0 top-8 bottom-[140px] z-40 md:top-12 md:bottom-[210px] transition-opacity duration-300',
          transcriptOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Scrollable transcript content */}
        <Fade top className="absolute inset-x-4 top-0 h-20 z-10" />
        <div className="relative z-10 flex flex-col h-full">
          {/* Scrollable messages */}
          <ScrollArea 
            ref={scrollAreaRef} 
            className="flex-1 px-4 pb-4 md:px-6"
            smoothScroll={false}
          >
            <ChatTranscript
              hidden={!transcriptOpen}
              messages={messages}
              className="mx-auto max-w-2xl space-y-3"
            />
          </ScrollArea>
        </div>
        
        {/* Close indicator / fade bottom */}
        <Fade bottom className="absolute inset-x-4 bottom-0 h-20 z-10" />
      </div>

      {/* Tile Layout */}
      <TileLayout chatOpen={chatOpen} />

      {/* Bottom */}
      <MotionBottom
        {...BOTTOM_VIEW_MOTION_PROPS}
        className="fixed inset-x-3 bottom-0 z-50 md:inset-x-12"
      >
        {appConfig.isPreConnectBufferEnabled && (
          <PreConnectMessage messages={messages} className="pb-4" />
        )}
        <div className="bg-background relative mx-auto max-w-2xl pb-3 md:pb-12">
          <Fade bottom className="absolute inset-x-0 top-0 h-4 -translate-y-full" />
          <AgentControlBar
            controls={controls}
            onChatOpenChange={setChatOpen}
            onTranscriptOpenChange={setTranscriptOpen}
            isChatOpen={chatOpen}
            isTranscriptOpen={transcriptOpen}
          />
        </div>
      </MotionBottom>
    </section>
  );
};
