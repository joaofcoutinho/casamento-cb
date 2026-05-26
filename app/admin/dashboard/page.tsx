import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, validarToken } from "@/lib/auth";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

// Página protegida: valida o cookie de sessão no servidor antes de renderizar.
export default function DashboardPage() {
  const autorizado = validarToken(cookies().get(ADMIN_COOKIE)?.value);
  if (!autorizado) {
    redirect("/admin");
  }
  return <AdminDashboard />;
}
