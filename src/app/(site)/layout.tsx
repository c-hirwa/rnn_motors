import Shell from "@/components/Shell";
import Effects from "@/components/Effects";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WaFloat from "@/components/WaFloat";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <Shell>
      <Effects />
      <Nav />
      <main>{children}</main>
      <Footer />
      <WaFloat />
    </Shell>
  );
}
