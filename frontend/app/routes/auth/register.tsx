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

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState("");
  const { t } = useTranslation();

  const registerSchema = z
    .object({
      name: z.string().min(3, t("validation.nameMin")),
      email: z.string().email(t("validation.invalidEmail")),
      password: z.string().min(8, t("validation.passwordMin")),
      password_confirmation: z.string(),
    })
    .refine((d) => d.password === d.password_confirmation, {
      message: t("validation.passwordsNoMatch"),
      path: ["password_confirmation"],
    });
  type RegisterForm = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    setServerError("");
    try {
      await api.post("/auth/register", data);
      const loginRes = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });
      setAuth(loginRes.data.data.token, loginRes.data.data.user);
      navigate("/");
    } catch (err: any) {
      const msg = err.response?.data?.message ?? t("auth.register.failed");
      setServerError(
        typeof msg === "string" ? msg : Object.values(msg).flat().join(", "),
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl bg-primary p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {t("auth.register.title")}
        </h1>

        {serverError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            placeholder={t("auth.register.name")}
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            type="email"
            placeholder={t("auth.register.email")}
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            type="password"
            placeholder={t("auth.register.password")}
            error={errors.password?.message}
            {...register("password")}
          />
          <Input
            type="password"
            placeholder={t("auth.register.confirmPassword")}
            error={errors.password_confirmation?.message}
            {...register("password_confirmation")}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("auth.register.submitting") : t("auth.register.submit")}
          </Button>
        </form>

        <p className="text-center text-iron-grey text-sm mt-6">
                    {t("auth.register.hasAccount")} {" "}
          <Link to="/auth/login" className="text-secondary hover:underline">
            {t("auth.register.signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
