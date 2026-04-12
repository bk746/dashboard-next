"use client";

import { useParams } from "next/navigation";
import AuditVisuelEditor from "@/app/audit-visuel/audit_components/AuditVisuelEditor";

export default function AuditVisuelDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0] ?? "";

  if (!id) {
    return null;
  }

  return <AuditVisuelEditor recordId={id} />;
}
