import Shell from "@/components/Shell";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WaFloat from "@/components/WaFloat";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <Shell>
      <Nav />
      <main>{children}</main>
      <Footer />
      <WaFloat />
    </Shell>
  );
}
