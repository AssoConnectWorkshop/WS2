export type BabyNameGender = "girl" | "boy" | "unisex";

export type BabyName = {
  id: number;
  name: string;
  gender: BabyNameGender;
  origin: string;
  meaning: string;
};

export const GENDER_LABELS: Record<BabyNameGender, string> = {
  girl: "Fille",
  boy: "Garçon",
  unisex: "Mixte",
};
