
import { forwardRef, useCallback, useRef } from 'react';
import { useAutoScroll } from '@/components/livekit/scroll-area/hooks/useAutoScroll';
import { cn } from '@/lib/utils';

interface ScrollAreaProps {
  children?: React.ReactNode;
  className?: string;
  smoothScroll?: boolean;
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { className, children, smoothScroll = true },
  ref
) {
  const scrollContentRef = useRef<HTMLDivElement>(null);

  useAutoScroll(scrollContentRef.current);

  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      scrollContentRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );

  return (
    <div 
      ref={mergedRef} 
      className={cn(
        'overflow-y-scroll',
        smoothScroll ? 'scroll-smooth' : 'scroll-auto',
        className
      )}
    >
      <div>{children}</div>
    </div>
  );
});
