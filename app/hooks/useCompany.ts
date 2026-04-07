"use client";

import { useMemo } from "react";
import {
  COMPANY_DEFAULT,
  migrateLegacyCompanyStreet,
  normalizeCompanyDenomination,
  normalizeCompanyEmail,
  type CompanySettings,
} from "@/app/config/company";
import { useJsonBucket } from "@/hooks/useJsonBucket";

export function useCompany(): [CompanySettings, (data: CompanySettings) => void] {
  const [raw, setRaw] = useJsonBucket<CompanySettings>("companySettings", COMPANY_DEFAULT);
  const merged = useMemo(() => {
    const m = { ...COMPANY_DEFAULT, ...raw };
    return migrateLegacyCompanyStreet({
      ...m,
      denomination: normalizeCompanyDenomination(m.denomination),
      email: normalizeCompanyEmail(m.email),
    });
  }, [raw]);
  const setCompany = (data: CompanySettings) => setRaw(data);
  return [merged, setCompany];
}
