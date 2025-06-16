import type { Metadata } from "next";

import { FormSelector } from "@/components/form-selector";

export const metadata: Metadata = {
  title: "typit.in - short and catchy temporary url to share notes",
};

function TextPage() {
  return <FormSelector initial="text" />;
}

export default TextPage;
