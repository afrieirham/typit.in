import type { Metadata } from "next";

import FormSelector from "@/app/_components/form-selector";

export const metadata: Metadata = {
  title: "typit.in - short and catchy temporary url to share files",
};

function FilePage() {
  return <FormSelector initial="file" />;
}

export default FilePage;
