// file: src/app/[locale]/sell/specs-form-client.tsx
"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const SpecsSchema = z.object({
  listingId: z.string().min(1),
  make: z.string().min(1, "Required"),
  model: z.string().min(1, "Required"),
  year: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1),
  mileageKm: z.coerce.number().int().min(0),
  category: z.enum([
    "CAR",
    "MOTORCYCLE",
    "VAN",
    "TRUCK",
    "BUS",
    "AGRI",
    "CONSTRUCTION",
    "OTHER",
  ]),
  fuel: z.enum(["PETROL", "DIESEL", "HYBRID", "PHEV", "EV", "LPG", "CNG"]),
  transmission: z.enum(["MANUAL", "AUTO"]),
  condition: z.enum(["NEW", "USED", "DAMAGED"]),
});

type SpecsValues = z.infer<typeof SpecsSchema>;


export default function SpecsFormClient({
  listingId,
}: {
  listingId: string;
  locale: string;
}) {
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [serverErr, setServerErr] = useState<string | null>(null);

  const form = useForm<SpecsValues>({
    // Cast keeps RHF & resolvers perfectly happy across minor version drifts
    resolver: zodResolver(SpecsSchema) as any,
    defaultValues: {
      listingId,
      make: "",
      model: "",
      year: new Date().getFullYear(),
      mileageKm: 0,
      category: "CAR",
      fuel: "PETROL",
      transmission: "MANUAL",
      condition: "USED",
    } as SpecsValues,
  });

  const onSubmit: SubmitHandler<SpecsValues> = async (values) => {
    setServerMsg(null);
    setServerErr(null);
    try {
      // Use absolute API path (not relative), avoids /mk/specs vs /mk/sell/specs mixups
      const res = await fetch("/api/sell/specs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) setServerErr(data?.error || "Failed to save specs");
      else setServerMsg("Specs saved ✅");
    } catch {
      setServerErr("Network error");
    }
  };


  const { register, handleSubmit, formState: { errors, isSubmitting } } = form;
  const input = "border p-2 rounded w-full";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 max-w-xl">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Make *</label>
          <input {...register("make")} className={input} placeholder="e.g., BMW" />
          {errors.make && <p className="text-sm text-red-600">{errors.make.message}</p>}
        </div>
        <div>
          <label className="text-sm">Model *</label>
          <input {...register("model")} className={input} placeholder="e.g., 320d" />
          {errors.model && <p className="text-sm text-red-600">{errors.model.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Year *</label>
          <input type="number" {...register("year")} className={input} />
          {errors.year && <p className="text-sm text-red-600">{String(errors.year.message)}</p>}
        </div>
        <div>
          <label className="text-sm">Mileage (km)</label>
          <input type="number" {...register("mileageKm")} className={input} />
          {errors.mileageKm && <p className="text-sm text-red-600">{String(errors.mileageKm.message)}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Fuel</label>
          <select {...register("fuel")} className={input}>
            <option>PETROL</option><option>DIESEL</option><option>HYBRID</option>
            <option>PHEV</option><option>EV</option><option>LPG</option><option>CNG</option>
          </select>
        </div>
        <div>
          <label className="text-sm">Transmission</label>
          <select {...register("transmission")} className={input}>
            <option>MANUAL</option><option>AUTO</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Category</label>
          <select {...register("category")} className={input}>
            <option>CAR</option><option>MOTORCYCLE</option><option>VAN</option><option>TRUCK</option>
            <option>BUS</option><option>AGRI</option><option>CONSTRUCTION</option><option>OTHER</option>
          </select>
        </div>
        <div>
          <label className="text-sm">Condition</label>
          <select {...register("condition")} className={input}>
            <option>NEW</option><option>USED</option><option>DAMAGED</option>
          </select>
        </div>
      </div>

      <input type="hidden" {...register("listingId")} />

      <button type="submit" disabled={isSubmitting} className="bg-black text-white px-4 py-2 rounded disabled:opacity-60">
        {isSubmitting ? "Saving…" : "Save Specs"}
      </button>

      {serverMsg && <p className="text-sm text-green-700">{serverMsg}</p>}
      {serverErr && <p className="text-sm text-red-600">{serverErr}</p>}
    </form>
  );
}
