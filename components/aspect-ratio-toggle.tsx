'use client';

import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { AspectRatio, aspectRatios } from '@/lib/aspect-ratios';

interface AspectRatioToggleProps {
  value: string;
  onValueChange: (ratio: AspectRatio) => void;
}

export function AspectRatioToggle({
  value,
  onValueChange,
}: AspectRatioToggleProps) {
  const [open, setOpen] = React.useState(false);

  const selectedRatio = aspectRatios.find(ratio => ratio.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between text-sm"
        >
          {selectedRatio ? selectedRatio.label : "Select aspect ratio..."}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search aspect ratio..." />
          <CommandEmpty>No aspect ratio found.</CommandEmpty>
          <CommandGroup>
            {aspectRatios.map((ratio) => (
              <CommandItem
                key={ratio.id}
                value={ratio.id}
                onSelect={() => {
                  onValueChange(ratio);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === ratio.value ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span>{ratio.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {ratio.description}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
