"use client";

import { useMemo } from "react";
import { COMPANY_DEFAULT, type CompanySettings } from "@/app/config/company";
import { useJsonBucket } from "@/hooks/useJsonBucket";

export function useCompany(): [CompanySettings, (data: CompanySettings) => void] {
  const [raw, setRaw] = useJsonBucket<CompanySettings>("companySettings", COMPANY_DEFAULT);
  const merged = useMemo(() => ({ ...COMPANY_DEFAULT, ...raw }), [raw]);
  const setCompany = (data: CompanySettings) => setRaw(data);
  return [merged, setCompany];
}
