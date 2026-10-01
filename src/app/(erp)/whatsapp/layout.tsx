import { WhatsAppActivityWatcher } from "@/src/features/whatsapp/WhatsAppActivityWatcher";

/** Mounted only under /whatsapp/* — the activity watcher used to live in
 * ErpShell and poll from every ERP page (appointments, patients, …). */
export default function WhatsAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WhatsAppActivityWatcher />
      {children}
    </>
  );
}
