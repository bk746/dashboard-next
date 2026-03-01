"use client";

import { useState, useEffect } from "react";
import {
  COMPANY_DEFAULT,
  getCompany,
  saveCompany,
  type CompanySettings,
} from "@/app/config/company";

export function useCompany(): [CompanySettings, (data: CompanySettings) => void] {
  const [company, setCompanyState] = useState<CompanySettings>(COMPANY_DEFAULT);

  useEffect(() => {
    setCompanyState(getCompany());
  }, []);

  const setCompany = (data: CompanySettings) => {
    saveCompany(data);
    setCompanyState(data);
  };

  return [company, setCompany];
}
