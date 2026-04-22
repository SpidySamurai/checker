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
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await addDriver(new FormData(e.currentTarget));
    setLoading(false);
    if ("error" in result) {
      setError(result.error);
    } else {
      setOpen(false);
      formRef.current?.reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5">
          <Plus size={14} />
          Agregar conductor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo conductor</DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="add-name">Nombre completo</Label>
            <Input id="add-name" name="name" placeholder="Carlos Mendoza" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-email">Email</Label>
            <Input id="add-email" name="email" type="email" placeholder="carlos@correo.com" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-password">Contraseña temporal</Label>
            <Input id="add-password" name="password" type="password" placeholder="mín. 8 caracteres" minLength={8} required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white" disabled={loading}>
              {loading ? "Creando…" : "Crear conductor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
