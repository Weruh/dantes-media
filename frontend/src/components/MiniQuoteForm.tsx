import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./Button";
import { cn } from "../utils/cn";

const miniSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(7, "Phone is required"),
  email: z.string().email("Valid email required"),
  serviceType: z.string().min(1, "Select a service"),
  message: z.string().min(10, "Message is required"),
});

type MiniFormValues = z.infer<typeof miniSchema>;

const serviceOptions = [
  "General Quote",
  "Security Assessment",
  "Network Audit",
  "Maintenance Contract",
  "Training",
];

const MiniQuoteForm = () => {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MiniFormValues>({ resolver: zodResolver(miniSchema) });

  const onSubmit = (data: MiniFormValues) => {
    setLoading(true);
    setSent(false);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      reset();
      void data;
    }, Math.floor(800 + Math.random() * 400));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
      <div>
        <input
          className={cn(
            "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-dark focus:outline-none",
            errors.name && "border-red-400"
          )}
          placeholder="Full name"
          {...register("name")}
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>
      <div>
        <input
          className={cn(
            "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-dark focus:outline-none",
            errors.phone && "border-red-400"
          )}
          placeholder="Phone"
          {...register("phone")}
        />
        {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
      </div>
      <div>
        <input
          className={cn(
            "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-dark focus:outline-none",
            errors.email && "border-red-400"
          )}
          placeholder="Email"
          {...register("email")}
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>
      <div>
        <select
          className={cn(
            "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-dark focus:outline-none",
            errors.serviceType && "border-red-400"
          )}
          defaultValue=""
          {...register("serviceType")}
        >
          <option value="" disabled>
            Select service type
          </option>
          {serviceOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errors.serviceType && (
          <p className="mt-1 text-xs text-red-500">{errors.serviceType.message}</p>
        )}
      </div>
      <div className="md:col-span-2">
        <textarea
          className={cn(
            "h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-dark focus:outline-none",
            errors.message && "border-red-400"
          )}
          placeholder="Tell us about your project"
          {...register("message")}
        />
        {errors.message && (
          <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>
        )}
      </div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Submit Request"}
        </Button>
        {sent && <span className="ml-3 text-sm text-ink-500">Thanks! We will reach out soon.</span>}
      </div>
    </form>
  );
};

export default MiniQuoteForm;
