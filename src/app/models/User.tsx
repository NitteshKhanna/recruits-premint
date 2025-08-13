export type User = {
    id: number;
    publicKey: string;
    discordHandle: string | null;
    inGameCurrency: number;
    access: "ADMIN" | "USER"; // or just string
    created: string;
    modified: string;
  };