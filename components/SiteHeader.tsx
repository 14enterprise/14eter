import Header from "./Header";
import { getProducts } from "@/lib/get-content";
import { currentSession } from "@/lib/auth-session";

export default async function SiteHeader() {
  const [products, session] = await Promise.all([getProducts(), currentSession()]);
  return <Header products={products} serverSession={session} />;
}