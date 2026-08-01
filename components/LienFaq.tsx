const faq = [
  ["What is a LIEN ID?", "Your permanent account identity inside the LIENIVERSE. It carries your role, progression, GLB, achievements, and seasonal history."],
  ["Is a LIEN ID an NFT?", "No. The current LIEN ID card is not minted as an NFT. Genesis LIENFTs are a separate planned collectible product."],
  ["Is a crypto wallet required?", "No wallet is required for the current Telegram-based onboarding and card creation flow."],
  ["Why is Telegram required?", "Telegram authenticates the account used by LIEN Ascension and connects the same LIEN ID across the current ecosystem."],
  ["What changes each season?", "Your LIEN ID number and lifetime history remain. A new seasonal card, level, XP, and seasonal progress record may begin; old cards remain archived."],
  ["What is GLB?", "Galactic LIEN Bucks are in-ecosystem reward and progression units. They are not currently cryptocurrency, cash, transferable value, or a promise of future token conversion."],
  ["Signal or Holographic?", "Both have the same access and progression. Holographic adds premium visual treatment and may qualify for Genesis whitelist consideration."],
  ["Does Holographic guarantee a Genesis LIENFT?", "No. Eligibility does not guarantee a mint, allocation, purchase opportunity, or free collectible."],
  ["Can I change my role?", "Season One role changes after activation are not self-service. Contact support; future-season rules are not finalized."],
  ["Can I regenerate my portrait?", "A generation purchase provides one initial generation. System failures remain attached to the paid order; unlimited regeneration is not included."],
  ["What if generation fails after payment?", "Do not pay again. Contact support with your Telegram username and Stripe receipt so the recoverable paid order can be reviewed or retried."],
  ["What does the QR code verify?", "It opens the card verification record for the displayed LIEN ID. It does not prove legal identity."],
  ["What does the badge mean?", "It means the LIEN account is connected through Telegram—not that a government identity check was performed."],
  ["What if I lose Telegram access?", "Self-service secondary recovery is not yet live. Contact support. Adding email, wallet, or passkey recovery remains a launch risk."],
  ["How is my photo used?", "Your photo is sent to an AI image service to create the portrait. The original is not displayed publicly by the card. See AI Image Consent and Privacy for current handling."],
  ["Can I request deletion?", "Yes. Use the support page to request account, original-photo, or generated-image deletion. Requests are handled manually during beta."],
] as const;

export function LienFaq() {
  return <div className="grid gap-3">{faq.map(([question, answer]) => (
    <details className="border border-white/15 bg-black/65 p-4" key={question}>
      <summary className="cursor-pointer font-display font-bold uppercase text-lime-100">{question}</summary>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">{answer}</p>
    </details>
  ))}</div>;
}
