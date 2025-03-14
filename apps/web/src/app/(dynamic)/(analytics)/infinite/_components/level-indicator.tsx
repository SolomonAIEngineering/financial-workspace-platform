import { _LEVELS } from '@/constants/levels';
import { cn } from '@/lib/utils';
import { getLevelColor } from '@/lib/request/level';

export function LevelIndicator({ level }: { level: (typeof _LEVELS)[number] }) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={cn('h-2.5 w-2.5 rounded-[2px]', getLevelColor(level).bg)}
      />
    </div>
  );
}
