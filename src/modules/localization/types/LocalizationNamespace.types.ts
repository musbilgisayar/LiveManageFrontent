export type LocalizationNamespaceRow = {
  id: string;
  name: string;
  keyCount?: number;
  createdAt?: string;
};

export type LocalizationNamespacesResponse =
  | string[]
  | {
      data?: string[];
      items?: string[];
      message?: string;
      userMessage?: string;
      status?: number;
      title?: string;
      detail?: string;
    };