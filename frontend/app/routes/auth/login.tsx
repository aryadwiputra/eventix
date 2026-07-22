import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useAuthStore } from "~/stores/auth";
import api from "~/lib/api";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState("");
  const { t } = useTranslation();

  const loginSchema = z.object({
    email: z.string().email(t("validation.invalidEmail")),
    password: z.string().min(1, t("validation.passwordRequired")),
  });
  type LoginForm = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setServerError("");
    try {
      const res = await api.post("/auth/login", data);
      setAuth(res.data.data.token, res.data.data.user);
      navigate("/");
    } catch (err: any) {
      setServerError(err.response?.data?.message ?? t("auth.login.failed"));
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl bg-primary p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {t("auth.login.title")}
        </h1>

        {serverError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            type="email"
            placeholder={t("auth.login.email")}
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            type="password"
            placeholder={t("auth.login.password")}
            error={errors.password?.message}
            {...register("password")}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("auth.login.submitting") : t("auth.login.submit")}
          </Button>
        </form>

        <p className="text-center text-iron-grey text-sm mt-6">
                    {t("auth.login.noAccount")} {" "}
          <Link to="/auth/register" className="text-secondary hover:underline">
            {t("auth.login.register")}
          </Link>
        </p>
      </div>
    </div>
  );
}
