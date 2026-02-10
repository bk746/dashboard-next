export interface Client {
  id: string;
  entreprise: string;
  patron: string;
  telephone: string;
  email: string;
  statut: "Actif" | "Inactif" | "Prospect";
  abonnement?: "Actif" | "Inactif";
  caTotal: number;
  projets: {
    enCours: number;
    actifs: number;
    termines: number;
  };
  derniereActivite: string;
}

