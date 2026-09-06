// Shared shape for the privacy policy documents in content.<locale>.ts.

export type Block =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "lines"; items: string[] }
  | { type: "dl"; items: { term: string; def: string }[] };

export type PrivacySection = {
  heading?: string;
  blocks: Block[];
};

export type PrivacyDoc = {
  title: string;
  sections: PrivacySection[];
};
