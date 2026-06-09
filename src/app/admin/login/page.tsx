import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  // Already signed in → skip the form.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/admin");

  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="font-heading text-xl font-bold">Volteroom Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to manage catalogue and content.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
