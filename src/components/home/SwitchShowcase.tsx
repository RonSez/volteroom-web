import { getTranslations } from "next-intl/server";
import { Section, SectionHeading } from "@/components/layout/Section";
import { getSlideImages } from "@/lib/slideshow";
import { MotionReveal } from "@/components/ui/Motion";
import { SwitchSlideshow } from "./SwitchSlideshow";

export async function SwitchShowcase() {
  const t = await getTranslations("home.switchShowcase");
  const images = await getSlideImages();

  return (
    <Section className="relative">
      {/* Cinematic glow that frames the signature scroll moment. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/3 -z-0 mx-auto h-[40vh] max-w-5xl rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(43, 164, 214,0.18) 0%, rgba(46, 120, 180,0.09) 40%, rgba(12, 14, 18,0) 70%)",
          filter: "blur(40px)",
        }}
      />
      <SectionHeading
        align="center"
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <MotionReveal variant="scale" amount={0.3} duration={0.9} className="relative mt-12">
        <SwitchSlideshow images={images} />
      </MotionReveal>
    </Section>
  );
}
