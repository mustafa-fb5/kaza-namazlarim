"use client";

import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { PrayerCounter } from "@/components/prayer-counter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PRAYERS } from "@/lib/prayers";
import { useKazaStore } from "@/hooks/use-kaza-store";
import { AuthModal } from "@/components/auth-modal";

const fmt = new Intl.NumberFormat("tr-TR");

export function KazaTracker() {
  const { store, ready, total, setCount, step, reset } = useKazaStore();

  return (
    <main className="mx-auto w-full max-w-xl px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-5 sm:pt-12 sm:pb-10">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon-192.png"
            alt="Dua Eden Eller Logo"
            className="size-8 rounded-xl border border-white/20 shadow-[0_0_15px_#2f6bff]"
          />
          <span className="inline-flex items-center gap-2 rounded-full border border-[#4d8dff]/30 bg-[#4d8dff]/10 px-3 py-1 text-xs font-medium tracking-wide text-blue-200 sm:px-3.5 sm:py-1.5 sm:text-[13px]">
            <span className="size-[7px] rounded-full bg-[#38d3ff] shadow-[0_0_12px_#38d3ff]" />
            Kaza Takip
          </span>
        </div>
        <AuthModal />
      </div>

      <header className="mb-5 text-center sm:mb-8">
        <h1 className="mt-4 mb-2 text-[clamp(32px,10vw,60px)] leading-[1.05] font-extrabold tracking-[-0.035em] sm:mt-5 sm:mb-2.5">
          Kaza <span className="text-shine">Namazlarım</span>
        </h1>
        <p className="text-sm font-light text-muted-foreground sm:text-base">
          Her vakit için kalan kaza sayını gir, kıldıkça azalt.
        </p>

        <Card className="mt-5 flex-row items-center justify-around gap-0 rounded-2xl border border-white/10 bg-[#091536] px-2 py-3.5 ring-0 sm:mt-7 sm:rounded-3xl sm:py-5">
          <div className="flex flex-1 flex-col gap-0.5 sm:gap-1">
            <span className="text-[10px] tracking-[0.12em] text-muted-foreground uppercase sm:text-xs">Toplam Kalan</span>
            <span id="total-count" className="text-2xl font-bold tracking-tight tabular-nums sm:text-[34px]">
              {ready ? fmt.format(total) : "–"}
            </span>
          </div>
          <div className="h-9 w-px bg-border sm:h-11" />
          <div className="flex flex-1 flex-col gap-0.5 sm:gap-1">
            <span className="text-[10px] tracking-[0.12em] text-muted-foreground uppercase sm:text-xs">Bugün Kılınan</span>
            <span id="today-count" className="text-2xl font-bold tracking-tight text-accent tabular-nums sm:text-[34px]">
              {ready ? fmt.format(store.today) : "–"}
            </span>
          </div>
        </Card>
      </header>

      <section aria-label="Namaz sayaçları" className="flex flex-col gap-3 sm:gap-4">
        {PRAYERS.map((p) => (
          <PrayerCounter
            key={p.id}
            prayer={p}
            value={store.counts[p.id] ?? 0}
            onStep={(d) => step(p.id, d)}
            onSet={(v) => setCount(p.id, v)}
          />
        ))}
      </section>

      <footer className="mt-6 flex flex-col items-center gap-3 text-xs text-muted-foreground sm:mt-8 sm:gap-3.5 sm:text-[13px]">
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                id="reset-btn"
                variant="outline"
                className="h-10 rounded-full border-border bg-transparent px-5 text-blue-200 hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
              />
            }
          >
            <RotateCcw className="size-4" /> Tümünü Sıfırla
          </AlertDialogTrigger>
          <AlertDialogContent className="ring-border">
            <AlertDialogHeader>
              <AlertDialogTitle>Tüm sayaçlar sıfırlansın mı?</AlertDialogTitle>
              <AlertDialogDescription>
                Girdiğin bütün kaza sayıları silinecek. Bu işlem geri alınamaz.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Vazgeç</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  reset();
                  toast.success("Tüm sayaçlar sıfırlandı");
                }}
              >
                Sıfırla
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <p>Veriler yalnızca bu cihazda saklanır.</p>
      </footer>
    </main>
  );
}
