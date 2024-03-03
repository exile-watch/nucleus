type Categories = 'abyssal-liches' | 'breachlords' | 'common-maps' | 'conquerors' | 'elder-guardians' | 'shaper-guardians'

type BossAbilityType = {
  name: string;
  type: string[]
  tip: string[]
  gif: string
  about: string[]
}

type BossType = {
  name: string;
  abilities: BossAbilityType[]
}

type MapType = {
  map?: string
  thumbnail?: string
  bosses: BossType[]
}

type CategoryPageType = {
  name: string;
  path: string;
  gif: string;
}[]

type HomepageObjType = {
  name: string;
  path: string;
  thumbnail: string | string[];
  gif: string | string[]
}

type HomepageType = Record<'main' | Categories, HomepageObjType[]>

type IndexedSearchType = {
  main: {
    mapPath: string;
    mapName: string;
  }[],
  encounters: {
    mapPath?: string;
    mapName?: string;
    encounterPath: string;
    encounterName: string;
  }[]
  encounterAbilities: {
    mapPath?: string;
    mapName?: string;
    encounterPath: string;
    encounterName: string;
    encounterAbilityPath: string;
    encounterAbilityName: string;
  }[]
}

type EncounersIndexPageObjType = {
  name: string;
  path: string;
  gif: string[]
}

type EncounersIndexPageType = Record<Categories, EncounersIndexPageObjType[]>

type SidebarNavigationPathsObjType = {
  label: string;
  path: string;
}

type SidebarNavigationPathsType = Record<Categories, SidebarNavigationPathsObjType[]>

export type {
  BossAbilityType,
  BossType,
  MapType,
  CategoryPageType,
  HomepageObjType,
  HomepageType,
  IndexedSearchType,
  EncounersIndexPageObjType,
  EncounersIndexPageType,
  SidebarNavigationPathsObjType,
  SidebarNavigationPathsType
}