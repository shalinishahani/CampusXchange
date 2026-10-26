import { createFileRoute } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CheckCircle2, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getServerEnv } from "@/lib/server-env";

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  error?: string;
  needsConfiguration?: boolean;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const submitContactMessage = createServerFn({ method: "POST" })
  .validator((data: ContactPayload) => {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid request payload");
    }
    return {
      name: String(data.name || "").trim(),
      email: String(data.email || "").trim(),
      message: String(data.message || "").trim(),
    };
  })
  .handler(async ({ data }): Promise<ContactResponse> => {
    const { name, email, message } = data;

    if (!name || name.length < 2 || name.length > 100) {
      return { success: false, error: "Name must be between 2 and 100 characters." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || email.length > 255) {
      return { success: false, error: "Please provide a valid email address." };
    }

    if (!message || message.length < 10 || message.length > 2000) {
      return { success: false, error: "Message must be between 10 and 2000 characters." };
    }

    const resendApiKey = getServerEnv("RESEND_API_KEY");
    const webhookUrl = getServerEnv("CONTACT_WEBHOOK_URL");
    const destinationEmail =
      getServerEnv("CONTACT_EMAIL") ||
      getServerEnv("CONTACT_TO_EMAIL") ||
      getServerEnv("ADMIN_EMAIL") ||
      "shalinishahani3@gmail.com";
    const fromEmail =
      getServerEnv("CONTACT_FROM_EMAIL") ||
      getServerEnv("RESEND_FROM_EMAIL") ||
      "CampusXchange Contact <onboarding@resend.dev>";

    if (!resendApiKey && !webhookUrl) {
      return {
        success: false,
        error:
          "Email service is not configured. Please set RESEND_API_KEY (and optionally CONTACT_EMAIL) in your Cloudflare Worker environment variables.",
        needsConfiguration: true,
      };
    }

    if (resendApiKey) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [destinationEmail],
            reply_to: email,
            subject: `New Contact Inquiry from ${name} - CampusXchange`,
            text: `New contact form submission:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; color: #1f2937;">
                <h2 style="color: #4f46e5; margin-top: 0; font-size: 20px;">New Message from CampusXchange</h2>
                <p style="margin: 8px 0;"><strong>Sender Name:</strong> ${escapeHtml(name)}</p>
                <p style="margin: 8px 0;"><strong>Sender Email:</strong> <a href="mailto:${escapeHtml(email)}" style="color: #4f46e5;">${escapeHtml(email)}</a></p>
                <div style="margin-top: 20px; padding: 16px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #f3f4f6;">
                  <strong style="display: block; margin-bottom: 8px; color: #374151;">Message:</strong>
                  <p style="white-space: pre-wrap; margin: 0; line-height: 1.6; color: #1f2937;">${escapeHtml(message)}</p>
                </div>
                <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">Sent via CampusXchange Contact Form</p>
              </div>
            `,
          }),
        });

        const resData = (await response.json().catch(() => ({}))) as {
          id?: string;
          message?: string;
          name?: string;
        };

        if (!response.ok || !resData?.id) {
          console.error("Resend API error:", resData);
          return {
            success: false,
            error:
              resData?.message ||
              "Resend did not confirm email delivery. Please verify your RESEND_API_KEY and domain permissions.",
          };
        }

        return { success: true };
      } catch (err: any) {
        console.error("Resend fetch error:", err);
        return {
          success: false,
          error: err?.message || "Failed to connect to email provider. Please try again later.",
        };
      }
    }

    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            message,
            source: "CampusXchange Contact Form",
            timestamp: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          return { success: false, error: "Failed to dispatch message to configured webhook." };
        }

        return { success: true };
      } catch (err: any) {
        console.error("Webhook dispatch error:", err);
        return { success: false, error: "Failed to reach contact webhook service." };
      }
    }

    return { success: false, error: "Unable to process contact request." };
  });

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — CampusXchange" },
      {
        name: "description",
        content: "Questions, feedback or a listing to report? Reach the CampusXchange team.",
      },
      { property: "og:title", content: "Contact — CampusXchange" },
      { property: "og:description", content: "Get in touch with the CampusXchange team." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [formData, setFormData] = useState<ContactPayload>({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const submitContact = useServerFn(submitContactMessage);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = formData.name.trim();
    const email = formData.email.trim();
    const message = formData.message.trim();

    if (!name || name.length < 2) {
      toast.error("Please enter your name (at least 2 characters).");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!message || message.length < 10) {
      toast.error("Please enter a message (at least 10 characters).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitContact({
        data: { name, email, message },
      });

      if (res.success) {
        setSubmitted(true);
        toast.success("Thank you! Your message has been sent.");
      } else {
        toast.error(res.error || "Failed to send message. Please try again.");
      }
    } catch (err: any) {
      console.error("Submission failed:", err);
      toast.error(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-4xl font-extrabold">Get in touch</h1>
      <p className="mt-3 text-muted-foreground">
        We usually reply within a day during the semester.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-[1fr_260px]">
        <Card className="p-8">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="size-12 text-primary" />
              <h2 className="mt-4 font-display text-2xl font-bold">Message sent!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Thank you for reaching out. We will get back to you as soon as possible.
              </p>
              <Button
                className="mt-6 rounded-full"
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: "", email: "", message: "" });
                }}
              >
                Send another message
              </Button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    maxLength={100}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    required
                    maxLength={255}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                  required
                  maxLength={2000}
                  disabled={isSubmitting}
                />
              </div>
              <Button type="submit" className="rounded-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Sending...
                  </>
                ) : (
                  "Send message"
                )}
              </Button>
            </form>
          )}
        </Card>

        <div className="space-y-4">
          {[
            { icon: MapPin, title: "Where", body: "Your campus, every campus" },
          ].map(({ icon: Icon, title, body }) => (
            <Card key={title} className="gap-1 p-5">
              <Icon className="size-5 text-primary" />
              <p className="font-semibold">{title}</p>
              <p className="text-sm text-muted-foreground">{body}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
