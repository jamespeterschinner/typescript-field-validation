export interface ExampleType {
  items?: {
    _id?: string;
    index?: number;
    guid?: string;
    isActive?: boolean;
    balance?: string;
    picture?: string;
    age?: number;
    eyeColor?: string;
    name?: string;
    gender?: string;
    company?: string;
    email?: string;
    phone?: string;
    address?: string;
    about?: string;
    registered?: string;
    latitude?: number;
    longitude?: number;
    tags?:
      | []
      | [string]
      | [string, string]
      | [string, string, string]
      | [string, string, string, string]
      | [string, string, string, string, string]
      | [string, string, string, string, string, string]
      | [string, string, string, string, string, string, string];
    friends?:
      | []
      | [
          {
            id?: number;
            name?: string;
            [k: string]: unknown;
          },
        ]
      | [
          {
            id?: number;
            name?: string;
            [k: string]: unknown;
          },
          {
            id?: number;
            name?: string;
            [k: string]: unknown;
          },
        ]
      | [
          {
            id?: number;
            name?: string;
            [k: string]: unknown;
          },
          {
            id?: number;
            name?: string;
            [k: string]: unknown;
          },
          {
            id?: number;
            name?: string;
            [k: string]: unknown;
          },
        ];
    greeting?: string;
    favoriteFruit?: string;
    [k: string]: unknown;
  }[];
}
