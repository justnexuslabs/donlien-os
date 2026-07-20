import Image from "next/image";

type AmbientGlowProps = {
  image: string;
  motion?: boolean;
};

export function AmbientGlow({ image, motion = false }: AmbientGlowProps) {
  return (
    <>
      <div className={`bg-reference ${motion ? "bg-reference-motion" : ""}`}>
        <Image src={image} alt="" fill priority sizes="100vw" />
      </div>
      <div className="scanlines" />
    </>
  );
}
