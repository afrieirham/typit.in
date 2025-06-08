import FormSelector from "@/components/form-selector";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "typit.in - short and catchy temporary url to share files",
};

function FilePage() {
  return <FormSelector initial="file" />;
}

export default FilePage;
