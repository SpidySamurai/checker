"use client";

import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { addVehicle } from "./actions";

export function AddVehicleDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await addVehicle(new FormData(e.currentTarget));
    setLoading(false);
    if ("error" in result) {
      setError(result.error ?? null);
    } else {
      setOpen(false);
      formRef.current?.reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5" />}>
        <Plus size={14} />
        Agregar vehículo
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo vehículo</DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="v-plate">Placa</Label>
              <Input id="v-plate" name="plate" placeholder="ABC-123" required className="uppercase" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-year">Año</Label>
              <Input id="v-year" name="year" type="number" placeholder="2022" min={2000} max={2030} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="v-make">Marca</Label>
              <Input id="v-make" name="make" placeholder="Nissan" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-model">Modelo</Label>
              <Input id="v-model" name="model" placeholder="Versa" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="v-color">Color</Label>
            <Input id="v-color" name="color" placeholder="Blanco" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white" disabled={loading}>
              {loading ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
