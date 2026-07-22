import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useAuthStore } from "~/stores/auth";
import api from "~/lib/api";

const registerSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState("");

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
      const msg = err.response?.data?.message ?? "Registration failed";
      setServerError(
        typeof msg === "string" ? msg : Object.values(msg).flat().join(", "),
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl bg-primary p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Create Your Account
        </h1>

        {serverError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            placeholder="Full name"
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            type="email"
            placeholder="Email address"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            type="password"
            placeholder="Password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Input
            type="password"
            placeholder="Confirm password"
            error={errors.password_confirmation?.message}
            {...register("password_confirmation")}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-iron-grey text-sm mt-6">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-secondary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
