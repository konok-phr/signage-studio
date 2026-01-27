import { Monitor, Smartphone, Square } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ASPECT_RATIOS } from '@/types/signage';

interface RatioSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ratioIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  '16:9': Monitor,
  '9:16': Smartphone,
  '1:1': Square,
  '4:3': Monitor,
};

export function RatioSelector({ value, onChange }: RatioSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Ratio:</span>
      <ToggleGroup type="single" value={value} onValueChange={(v) => v && onChange(v)}>
        {ASPECT_RATIOS.map((ratio) => {
          const Icon = ratioIcons[ratio.value] || Monitor;
          return (
            <ToggleGroupItem
              key={ratio.value}
              value={ratio.value}
              aria-label={ratio.label}
              className="gap-1.5 px-3"
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs">{ratio.label}</span>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
    </div>
  );
}
