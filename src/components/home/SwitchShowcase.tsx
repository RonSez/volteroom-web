import { getTranslations } from "next-intl/server";
import { Section, SectionHeading } from "@/components/layout/Section";
import { getSlideImages } from "@/lib/slideshow";
import { SwitchSlideshow } from "./SwitchSlideshow";

export async function SwitchShowcase() {
  const t = await getTranslations("home.switchShowcase");
  const images = await getSlideImages();

  return (
    <Section>
      <SectionHeading
        align="center"
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <div className="mt-12">
        <SwitchSlideshow images={images} />
      </div>
    </Section>
  );
}
