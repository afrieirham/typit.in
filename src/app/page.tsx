import type { Metadata } from "next";

import FormSelector from "./_components/form-selector";

export const metadata: Metadata = {
  title: "typit.in - catchiest temporary url shortener",
};

export default function Home() {
  return <FormSelector initial="url" />;
}
