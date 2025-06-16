import type { Metadata } from "next";

import FormSelector from "@/app/_components/form-selector";

export const metadata: Metadata = {
  title: "typit.in - short and catchy temporary url to share links",
};

function UrlPage() {
  return <FormSelector initial="url" />;
}

export default UrlPage;
