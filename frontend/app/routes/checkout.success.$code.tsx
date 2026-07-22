import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { CheckCircle, PackageOpen } from "lucide-react";
import { Button } from "~/components/ui/button";
import api from "~/lib/api";
import { useTranslation } from "react-i18next";

interface TransactionData {
  code: string;
  name: string;
  email: string;
  status: string;
  total_amount: number;
  fee_amount: number;
  unique_amount: number;
  payment_method: string | null;
  payment_deadline: string | null;
  created_at: string;
  event: { name: string };
}

export default function CheckoutSuccessPage() {
  const { code } = useParams();
  const [tx, setTx] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (!code) return;
    api.get(`/checkout/${code}`).then((res) => {
      setTx(res.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-iron-grey">{t("common.loading")}</div>
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <PackageOpen className="w-16 h-16 text-iron-grey mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t("checkoutSuccess.notFound")}</h2>
          <Link to="/" className="text-secondary hover:underline">{t("checkoutSuccess.backHome")}</Link>
        </div>
      </div>
    );
  }

  const deadline = tx.payment_deadline
    ? new Date(tx.payment_deadline).toLocaleString("id-ID")
    : null;

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 relative">
      <img src="/svgs/wavy-line-4.svg" className="absolute bottom-0 w-full -z-10" alt="" />
      <div className="w-full max-w-lg text-center">
        <div className="rounded-2xl bg-primary p-8">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>

          <h1 className="text-2xl font-bold mb-2">{t("checkoutSuccess.title")}</h1>
          <p className="text-iron-grey mb-6">
            {t("checkoutSuccess.subtitle")}
          </p>

          <div className="rounded-xl bg-bluish-purple p-5 space-y-3 text-left mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-pastel-purple">{t("checkoutSuccess.transaction")}</span>
              <span className="font-mono font-semibold">{tx.code}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-pastel-purple">{t("checkoutSuccess.event")}</span>
              <span>{tx.event.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-pastel-purple">{t("checkoutSuccess.name")}</span>
              <span>{tx.name}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-primary pt-3">
              <span>{t("checkoutSuccess.total")}</span>
              <span className="text-secondary">
                Rp {tx.total_amount.toLocaleString("id-ID")}
              </span>
            </div>
            {deadline && (
              <div className="flex justify-between text-sm">
                <span className="text-pastel-purple">{t("checkoutSuccess.payBefore")}</span>
                <span className="text-butter-yellow">{deadline}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Link to="/dashboard/tickets">
              <Button variant="secondary" className="w-full">
                {t("checkoutSuccess.viewTickets")}
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full">
                {t("checkoutSuccess.backHome")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
