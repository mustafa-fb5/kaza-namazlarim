"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Prayer } from "@/lib/prayers";

type Props = {
  prayer: Prayer;
  value: number;
  onStep: (delta: number) => void;
  onSet: (value: number) => void;
};

/** Basılı tutulduğunda giderek hızlanan tekrar. */
function useHoldRepeat(action: () => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionRef = useRef(action);
  useEffect(() => {
    actionRef.current = action;
  }, [action]);

  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const start = () => {
    stop();
    actionRef.current();
    let speed = 180;
    const loop = () => {
      actionRef.current();
      speed = Math.max(40, speed * 0.85);
      timer.current = setTimeout(loop, speed);
    };
    timer.current = setTimeout(loop, 450);
  };

  useEffect(() => stop, []);

  return {
    onPointerDown: (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      start();
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        actionRef.current();
      }
    },
  };
}

export function PrayerCounter({ prayer, value, onStep, onSet }: Props) {
  const Icon = prayer.icon;
  const [draft, setDraft] = useState<string | null>(null);

  const dec = useHoldRepeat(() => onStep(-1));
  const inc = useHoldRepeat(() => onStep(1));

  const commit = () => {
    if (draft !== null) onSet(Number(draft));
    setDraft(null);
  };

  const done = value === 0;

  return (
    <Card
      id={`card-${prayer.id}`}
      style={{ "--accent": prayer.accent } as React.CSSProperties}
      className={cn(
        "group relative gap-0 rounded-2xl border border-white/10 py-0 sm:rounded-3xl",
        "bg-[#091536]"
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{ background: `radial-gradient(400px 120px at 0% 0%, ${prayer.accent}, transparent 70%)` }}
      />

      <CardContent className="relative space-y-3.5 p-3.5 sm:space-y-5 sm:p-5">
        <div className="flex items-center gap-3 sm:gap-3.5">
          <div
            className="grid size-10 shrink-0 place-items-center rounded-xl text-white sm:size-12 sm:rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${prayer.accent}, rgba(255,255,255,0.05))`,
              boxShadow: `0 8px 22px -8px ${prayer.accent}, inset 0 1px 0 rgba(255,255,255,0.25)`,
            }}
          >
            <Icon className="size-5 sm:size-[22px]" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg leading-tight font-semibold tracking-tight sm:text-[21px]">{prayer.name}</h2>
            <p className="truncate text-xs text-muted-foreground sm:text-[13px]">{prayer.meta}</p>
          </div>
          {done ? (
            <Badge className="shrink-0 gap-1 border-accent/40 bg-accent/15 text-accent">
              <Check className="size-3" /> Borç yok
            </Badge>
          ) : (
            <Badge variant="outline" className="shrink-0 border-white/15 text-muted-foreground">
              kaza
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-[48px_1fr_48px] items-center gap-2 rounded-2xl border border-white/10 bg-[#030a1e]/50 p-1.5 sm:grid-cols-[64px_1fr_64px] sm:gap-2.5 sm:rounded-[22px] sm:p-2">
          <Button
            id={`dec-${prayer.id}`}
            type="button"
            aria-label={`${prayer.name} azalt`}
            disabled={done}
            {...dec}
            className={cn(
              "h-12 w-full touch-none rounded-xl border-white/15 text-blue-50 sm:h-16 sm:rounded-2xl",
              "bg-linear-to-br from-[#4d8dff]/25 to-[#2f6bff]/5",
              "hover:from-[#4d8dff] hover:to-[#1f4fe0] hover:shadow-[0_10px_28px_-8px_#2f6bff]",
              "active:scale-90"
            )}
          >
            <ChevronLeft className="size-5 sm:size-6" strokeWidth={2.6} />
          </Button>

          <Input
            id={`count-${prayer.id}`}
            type="number"
            inputMode="numeric"
            min={0}
            aria-label={`${prayer.name} kaza sayısı`}
            value={draft ?? String(value)}
            onChange={(e) => setDraft(e.target.value)}
            onFocus={(e) => e.target.select()}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") {
                setDraft(null);
                e.currentTarget.blur();
              }
            }}
            className={cn(
              "h-12 border-none bg-transparent px-1 text-center text-[32px] font-bold tracking-tight tabular-nums shadow-none sm:h-16 sm:text-[40px]",
              "focus-visible:bg-primary/10 focus-visible:ring-0 dark:bg-transparent",
              done && "text-accent"
            )}
          />

          <Button
            id={`inc-${prayer.id}`}
            type="button"
            aria-label={`${prayer.name} artır`}
            {...inc}
            className={cn(
              "h-12 w-full touch-none rounded-xl border-white/15 text-blue-50 sm:h-16 sm:rounded-2xl",
              "bg-linear-to-br from-[#4d8dff]/25 to-[#2f6bff]/5",
              "hover:from-[#4d8dff] hover:to-[#1f4fe0] hover:shadow-[0_10px_28px_-8px_#2f6bff]",
              "active:scale-90"
            )}
          >
            <ChevronRight className="size-5 sm:size-6" strokeWidth={2.6} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
