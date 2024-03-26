type Categories =
  | "abyssal-liches"
  | "breachlords"
  | "common-maps"
  | "conquerors"
  | "elder-guardians"
  | "shaper-guardians";

type BossAbilityType = {
  name: string;
  type: string[];
  tip: string[];
  gif: string;
  about: string[];
};

type BossType = {
  name: string;
  abilities: BossAbilityType[];
};

type MapType = {
  map?: string;
  thumbnail?: string;
  encounters: BossType[];
};

type CategoryPageType = {
  name: string;
  path: string;
  gif: string;
}[];

type HomepageObjType = {
  name: string;
  path: string;
  thumbnail: string | string[];
  gif: string | string[];
};

type HomepageType = {
  main: HomepageObjType[];
} & Record<Categories, HomepageObjType>;

type IndexedSearchTypeItem = {
  mapPath?: string;
  mapName?: string;
  encounterPath: string;
  encounterName?: string;
  encounterAbilityPath?: string;
  encounterAbilityName?: string;
};

type IndexedSearchType = {
  maps: IndexedSearchTypeItem[];
  encounters: IndexedSearchTypeItem[];
  encounterAbilities: IndexedSearchTypeItem[];
};

type EncountersIndexPageObjType = {
  name: string;
  path: string;
  gif: string[];
};

type EncountersIndexPageType = Record<Categories, EncountersIndexPageObjType>;

type SidebarNavigationPathsObjType = {
  label: string;
  path: string;
};

type SidebarNavigationPathsType = Record<
  Categories,
  SidebarNavigationPathsObjType[]
>;

export type {
  BossAbilityType,
  BossType,
  MapType,
  CategoryPageType,
  HomepageObjType,
  HomepageType,
  IndexedSearchType,
  IndexedSearchTypeItem,
  EncountersIndexPageObjType,
  EncountersIndexPageType,
  SidebarNavigationPathsObjType,
  SidebarNavigationPathsType,
};

export * from "./extracted-data";
