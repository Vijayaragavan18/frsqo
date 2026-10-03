import { Instagram, Mail, MapPin, Linkedin } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import FadeUp from "@/components/FadeUp";

export const metadata = {
  title: "Contact — frsqo",
  description: "Have a question before booking? Tell us what you need and we'll get back to you.",
};

export default function ContactPage() {
  return (
    <section className="bg-cream py-20 md:py-28">
      <div className="container-froska grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <FadeUp>
          <span className="section-label">Contact</span>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Let&rsquo;s talk about your space.
          </h1>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-ink/60">
            Have a question before booking? Tell us what you need and we&rsquo;ll get back
            to you.
          </p>

          <div className="mt-10 flex flex-col gap-4">
            <ContactRow icon={Mail} label="t.vijayragavan.be@gmail.com" href="mailto:t.vijayragavan.be@gmail.com" />
            <ContactRow icon={Instagram} label="@frsqo.home" href="https://www.instagram.com/wefrsqo" />
            <ContactRow icon={Linkedin} label="@frsqo" href="https://www.linkedin.com/company/wefrsqo/" />
            <ContactRow icon={MapPin} label="Serving homes across your metro area" />
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <ContactForm />
        </FadeUp>
      </div>
    </section>
  );
}

function ContactRow({
  icon: Icon,
  label,
  href,
}: {
  icon: typeof Mail;
  label: string;
  href?: string;
}) {
  const content = (
    <span className="flex items-center gap-3 text-sm text-ink/70">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-green-600 shadow-card">
        <Icon size={16} />
      </span>
      {label}
    </span>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="hover:text-green-700">
        {content}
      </a>
    );
  }
  return content;
}
