"use client";

import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { addDriver } from "./actions";

export function AddDriverDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await addDriver(new FormData(e.currentTarget));
    setLoading(false);
    if ("error" in result) {
      setError(result.error ?? null);
    } else {
      setSent(true);
      setTimeout(() => { setOpen(false); setSent(false); formRef.current?.reset(); }, 1800);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setSent(false); setError(null); } }}>
      <DialogTrigger render={<Button className="gap-1.5" />}>
        <Plus size={14} />
        Agregar conductor
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invitar conductor</DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="py-6 text-center text-primary font-medium text-sm">
            ✓ Invitación enviada — el conductor recibirá un email para crear su contraseña.
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              El conductor recibirá un email para crear su contraseña y acceder a la app.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="add-name">Nombre completo</Label>
              <Input id="add-name" name="name" placeholder="Carlos Mendoza" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-email">Email</Label>
              <Input id="add-email" name="email" type="email" placeholder="carlos@correo.com" required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Enviando…" : "Enviar invitación"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
