import React from "react";

import { api } from "@/trpc/server";
import { PasswordForm } from "./_components/password-form";
import { PasswordlessDisplay } from "./_components/passwordless-display";

type Params = Promise<{ code: string }>;

async function DisplayPage(props: { params: Params }) {
  const { code } = await props.params;

  const requirePassword = await api.link.isRequirePassword({ code });

  if (requirePassword) {
    return <PasswordForm code={code} />;
  }

  return <PasswordlessDisplay code={code} />;
}

export default DisplayPage;
