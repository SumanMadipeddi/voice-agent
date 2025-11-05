import { Button } from '@/components/livekit/button';
import { cn } from '@/lib/utils';

interface TranscriptionToggleButtonProps {
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  className?: string;
}

export function TranscriptionToggleButton({
  isOpen = false,
  onToggle,
  className,
}: TranscriptionToggleButtonProps) {
  const handleToggle = () => {
    onToggle?.(!isOpen);
  };

  return (
    <Button
      variant="secondary"
      onClick={handleToggle}
      className={cn('font-mono text-xs', className)}
      aria-label={isOpen ? 'Hide transcriptions' : 'Show transcriptions'}
    >
      {isOpen ? 'HIDE TRANSCRIPT' : 'SHOW TRANSCRIPT'}
    </Button>
  );
}

