import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, MailCheck } from "lucide-react";
import { FloatingInput } from "../shared/components/FloatingInput";
import { AutoGrowTextarea } from "../shared/components/AutoGrowTextarea";
import { Button } from "../shared/components/Button";
import { useSendMessage } from "../features/contact";

const contactSchema = z.object({
  title: z.string().min(3, "3-50 characters").max(50, "3-50 characters"),
  senderName: z.string().min(2, "2-30 characters").max(30, "2-30 characters"),
  senderEmail: z.string().email("Invalid email address"),
  context: z
    .string()
    .min(3, "3-10,000 characters")
    .max(10000, "3-10,000 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

function ConfirmationView({ onBackHome }: { onBackHome: () => void }) {
  return (
    <div className="text-center">
      <MailCheck className="mx-auto mb-4 h-16 w-16 text-success" />
      <h1 className="mb-3 text-xl font-semibold text-text-primary">
        Message sent!
      </h1>
      <p className="mb-8 text-sm text-text-secondary">
        Thanks for reaching out — I'll get back to you soon. Note that
        another message can't be sent for the next 5 minutes.
      </p>
      <Button
        type="button"
        onClick={onBackHome}
        className="mx-auto rounded-lg bg-accent-dark px-6 py-2 font-medium text-text-primary transition-colors duration-300 hover:bg-accent-dark/80"
      >
        Back to Home
      </Button>
    </div>
  );
}

export function ContactPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const sendMessage = useSendMessage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { title: "", senderName: "", senderEmail: "", context: "" },
  });

  function onSubmit(values: ContactFormValues) {
    sendMessage.mutate(values, {
      onSuccess: () => setSubmitted(true),
    });
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-border-default bg-bg-surface/60 p-10 shadow-xl backdrop-blur-md">
        {submitted ? (
          <ConfirmationView onBackHome={() => navigate("/")} />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <h1 className="sr-only">Contact</h1>
            <div className="mb-8 flex justify-center">
              {/* Traces the exact same rect, same width, as lucide's own
                  Mail glyph (x:2 y:4 w:20 h:16 rx:2 in its 24x24 viewBox) —
                  the stroke itself lines up exactly with and is fully
                  hidden behind the icon's own stroke (painted on top), so
                  only the drop-shadow's blur (see .mail-trace) pokes out
                  past the icon's edge on the outside and inside as it
                  travels around. */}
              <div className="relative flex h-14 w-14 items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="absolute inset-0 h-full w-full overflow-visible"
                >
                  <rect
                    x="2"
                    y="4"
                    width="20"
                    height="16"
                    rx="2"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="mail-trace stroke-accent"
                  />
                </svg>
                <Mail className="relative h-14 w-14 text-text-secondary/70" />
              </div>
            </div>
            <div className="space-y-7">
              <FloatingInput
                id="title"
                label="Title"
                error={errors.title?.message}
                {...register("title")}
              />
              <FloatingInput
                id="senderName"
                label="Your Name"
                error={errors.senderName?.message}
                {...register("senderName")}
              />
              <FloatingInput
                id="senderEmail"
                label="Your Email"
                type="email"
                error={errors.senderEmail?.message}
                {...register("senderEmail")}
              />
              <AutoGrowTextarea
                id="context"
                label="Message"
                error={errors.context?.message}
                {...register("context")}
              />
            </div>
            <div className="mt-9">
              <Button
                type="submit"
                isLoading={sendMessage.isPending}
                className="mx-auto w-1/2 rounded-lg bg-accent-dark px-4 py-2 font-medium text-text-primary transition-colors duration-300 ease-out hover:bg-accent-dark/80"
              >
                Send
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
