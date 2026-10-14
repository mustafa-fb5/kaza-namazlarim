"use client";

import { useState } from "react";
import { LogIn, LogOut, User as UserIcon, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AuthModal() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Lütfen e-posta ve şifrenizi girin.");
      return;
    }
    if (password.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await signUp(email, password);
        toast.success("Hesabınız oluşturuldu ve giriş yapıldı!");
      } else {
        await signIn(email, password);
        toast.success("Giriş yapıldı!");
      }
      setOpen(false);
      setEmail("");
      setPassword("");
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error(error);
      if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
        toast.error("E-posta veya şifre hatalı.");
      } else if (error.code === "auth/email-already-in-use") {
        toast.error("Bu e-posta adresi zaten kullanımda.");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Geçersiz e-posta formatı.");
      } else if (error.code === "auth/weak-password") {
        toast.error("Şifre çok zayıf. En az 6 karakter giriniz.");
      } else {
        toast.error("Giriş işlemi başarısız: " + (error.message || "Bilinmeyen hata"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Çıkış yapıldı.");
    } catch (err) {
      console.error(err);
      toast.error("Çıkış yapılırken bir hata oluştu.");
    }
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled className="h-8 gap-1.5 rounded-full border border-white/10 text-xs">
        <Loader2 className="size-3 animate-spin" />
      </Button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-1.5 rounded-full border border-[#38d3ff]/30 bg-[#38d3ff]/10 px-3 py-1 text-xs text-[#a9c8ff] sm:flex">
          <UserIcon className="size-3 text-[#38d3ff]" />
          <span className="max-w-[140px] truncate">{user.email}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="h-8 gap-1.5 rounded-full border-white/15 bg-white/5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-3" />
          <span>Çıkış Yap</span>
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            size="sm"
            className="h-8 gap-1.5 rounded-full border border-[#4d8dff]/40 bg-[#2f6bff]/20 px-3.5 text-xs text-blue-100 shadow-[0_0_15px_-3px_#2f6bff] backdrop-blur-md hover:bg-[#2f6bff]/40"
          />
        }
      >
        <LogIn className="size-3.5" />
        <span>Giriş Yap / Kaydol</span>
      </DialogTrigger>

      <DialogContent className="border-white/15 bg-[#070e28]/90 text-white backdrop-blur-2xl ring-0">
        <DialogHeader>
          <div className="mx-auto mb-2 grid size-10 place-items-center rounded-2xl bg-[#2f6bff]/20 text-[#38d3ff] shadow-[0_0_20px_#2f6bff]">
            <Sparkles className="size-5" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">
            {isRegister ? "Yeni Hesap Oluştur" : "Kaza Takibine Giriş Yap"}
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground">
            {isRegister
              ? "Kaza namazı verilerini tüm cihazlarında senkronize etmek için hesap oluştur."
              : "Verilerine her cihazdan erişmek için e-posta ve şifrenle giriş yap."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">E-posta</label>
            <Input
              type="email"
              placeholder="ornek@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-xl border-white/15 bg-white/5 text-sm text-white placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-[#38d3ff]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Şifre</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 rounded-xl border-white/15 bg-white/5 text-sm text-white placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-[#38d3ff]"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="mt-2 h-10 w-full rounded-xl bg-linear-to-r from-[#2f6bff] to-[#38d3ff] font-semibold text-white shadow-[0_8px_20px_-6px_#2f6bff] hover:opacity-95"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : isRegister ? (
              "Kayıt Ol"
            ) : (
              "Giriş Yap"
            )}
          </Button>

          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-[#a9c8ff] hover:underline"
            >
              {isRegister
                ? "Zaten bir hesabın var mı? Giriş yap"
                : "Hesabın yok mu? Yeni hesap oluştur"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
