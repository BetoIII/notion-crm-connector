import { SendSMSFlow } from "@/components/messages/send-sms-flow";

export default function SendSMSPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <SendSMSFlow />
      </div>
    </div>
  );
}
