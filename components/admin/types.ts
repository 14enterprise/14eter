import type { Json } from "@/components/admin/SectionEditor";

export type SectionRow = {
  id: number;
  key: string;
  label: string;
  sort: number;
  updatedAt: number;
  content: Record<string, Json>;
};

export type PageRow = {
  id: number;
  slug: string;
  title: string;
  sections: SectionRow[];
};

export type PartnerRow = {
  name: string;
  tag?: string;
  website?: string;
};

export type PartnerUserRow = {
  email: string;
  name: string;
  status: string;
};

export type ClientRow = {
  id: number;
  name: string;
  email: string;
  company: string;
  projectName: string;
  projectType: string;
  model: "partner" | "diy";
  status: string;
  appSlug: string;
  createdAt: number;
};
