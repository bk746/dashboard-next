"use client";

import { useParams } from "next/navigation";
import EstimationEditor from "../estimation_components/EstimationEditor";

export default function EstimationDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0] ?? "";

  if (!id) {
    return null;
  }

  return <EstimationEditor estimationId={id} />;
}
