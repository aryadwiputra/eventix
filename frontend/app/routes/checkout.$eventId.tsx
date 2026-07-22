import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useAuthStore, type AuthUser } from "~/stores/auth";
import api from "~/lib/api";

const checkoutSchema = z.object({
  name: z.string().min(3, "Min 3 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Min 10 digits").max(15),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

interface SelectedTicket {
  id: number;
  name: string;
  qty: number;
  price: number;
}

interface EventSummary {
  id: number;
  name: string;
  start_time: string;
  location: string | null;
  category: { name: string } | null;
}

export default function CheckoutPage() {
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user) as AuthUser | null;
  const selectedTickets = (location.state as { tickets?: SelectedTicket[] })?.tickets ?? [];

  const [event, setEvent] = useState<EventSummary | null>(null);
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "", phone: "" },
  });

  useEffect(() => {
    if (selectedTickets.length === 0) {
      navigate(`/events/${eventId}`, { replace: true });
      return;
    }
    api.get(`/events/${eventId}`).then((res) => {
      setEvent(res.data.data);
    }).catch(() => {}).finally(() => setLoadingEvent(false));
  }, []);

  const subtotal = selectedTickets.reduce((s, t) => s + t.qty * t.price, 0);
  const total = subtotal;

  const onSubmit = async (data: CheckoutForm) => {
    setServerError("");
    setSubmitting(true);
    try {
      const res = await api.post("/checkout", {
        event_id: Number(eventId),
        name: data.name,
        email: data.email,
        phone: data.phone,
        items: selectedTickets.map((t) => ({ ticket_id: t.id, quantity: t.qty })),
      });
      navigate(`/checkout/success/${res.data.data.code}`, { replace: true });
    } catch (err: any) {
      setServerError(err.response?.data?.message ?? "Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingEvent) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-iron-grey">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <Link
          to={`/events/${eventId}`}
          className="inline-flex items-center gap-2 text-iron-grey hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Event
        </Link>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-3 space-y-6">
            {event && (
              <div className="rounded-2xl bg-primary p-5">
                <p className="text-xs text-pastel-purple mb-1">Event</p>
                <p className="font-semibold text-lg">{event.name}</p>
                <p className="text-sm text-iron-grey">
                  {event.category?.name} · {new Date(event.start_time).toLocaleDateString("id-ID")}
                  {event.location && ` · ${event.location}`}
                </p>
              </div>
            )}

            <div className="rounded-2xl bg-primary p-6">
              <h2 className="text-lg font-bold mb-5">Your Information</h2>

              {serverError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm">
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <Input
                  placeholder="Full Name"
                  error={errors.name?.message}
                  {...register("name")}
                />
                <Input
                  type="email"
                  placeholder="Email Address"
                  error={errors.email?.message}
                  {...register("email")}
                />
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  error={errors.phone?.message}
                  {...register("phone")}
                />
                <Button type="submit" variant="secondary" className="w-full" disabled={submitting}>
                  {submitting
                    ? "Processing..."
                    : `Pay Rp ${total.toLocaleString("id-ID")}`}
                </Button>
              </form>
            </div>

            <div className="flex items-center gap-2 text-xs text-iron-grey">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              Secured by Midtrans. Your payment info is encrypted.
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-2xl bg-primary p-6 space-y-4">
              <h3 className="font-bold text-secondary">Order Summary</h3>

              {selectedTickets.map((t) => (
                <div key={t.id} className="flex justify-between text-sm">
                  <span className="text-iron-grey">
                    {t.name} × {t.qty}
                  </span>
                  <span>Rp {(t.qty * t.price).toLocaleString("id-ID")}</span>
                </div>
              ))}

              <div className="border-t border-bluish-purple pt-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-iron-grey">Subtotal</span>
                  <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-secondary">
                    Rp {total.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
