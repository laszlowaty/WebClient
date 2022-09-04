import { ReactNode } from 'react';

export type DeepPartial<T> = T extends Function ? T : (T extends object ? { [P in keyof T]?: DeepPartial<T[P]>; } : T);

export type ConsoleLine = {
  raw: string,
  text: string,
  formatted: ReactNode,
}

export type Themecolor = {
  saturation: number, // [0 - 1] colors saturation
  brightBoost: number, // [0 - 1] by how much bright colours are lighter than normal
  backgroundHinder: number, // [0 - 1] by how much background color is darker than the same foreground color
  colorBase: number, // [0 - 255] minimal value of any rgb component - basically minimum luminosity
  colorTop: number, // [0 - 255] maximum value of any rgb component - basically maximum luminosity
  /*
   * [0 - 1] the black text color is special because it has to be boosted up to be visible
   * this value is percentage of the normal color text luminosity
   */
  blackBoost: number,
}

export type ThemeFontSettings = {
  family: string,
  size: number,
  letterSpacing: number,
  lineHeight: number,
}

export type Theme = {
  color: Themecolor,
  font: ThemeFontSettings,
}

export type Settings = {
  theme: Theme,
}

export type ConnSettings = {
  echo: boolean,
  keepAlive: boolean,
  proxyProtocol: string,
  proxyHost: string,
  proxyPort: string,
}

export type MapData = {
  anonymousAreaName: string,
  defaultAreaName: string,
  areaCount: number,
  areas: MapArea[],
  customEnvColors: MapEnvColor[],
  formatVersion: number,
  labelCount: number,
  mapSymbolFontDetails: string,
  mapSymbolFontFudgeFactor: number,
  onlyMapSymbolFontToBeUsed: boolean,
  playerRoomColors: MapColor[],
  playerRoomInnerDiameterPercentage: number,
  playerRoomOuterDiameterPercentage: number,
  playerRoomStyle: number,
  playersRoomId: MapPlayerData,
  roomCount: number,
  userData: MapUserData,
};

export type MapRGBColor = [red: number, green: number, blue: number];

export type MapEnvColor = {
  color24RGB: MapRGBColor,
  id: number,
}

export type MapColor = {
  color24RGB: MapRGBColor,
}

export type MapCoordinates = [x: number, y: number, z: number];

export type MapSize = [w: number, h: number];

export type MapImageData = string[];

export type MapArea = {
  id: number,
  name: string,
  labels?: MapLabel[],
  roomCount: number,
  rooms: MapRoom[],
}

export type MapLabel = {
  colors: MapColor[],
  coordinates: MapCoordinates,
  id: number,
  image: MapImageData,
  scaledels: boolean,
  showOnTop: boolean,
  size: MapSize,
  text: string,
}

export type MapRoom = {
  id: number,
  coordinates: MapCoordinates,
  environment: number,
  exists: MapExit[],
  userData?:   MapRoomUserData;
  name?:       string;
  weight?:     number;
  symbol?:     MapSymbol;
  locked?:     boolean;
  stubExits?:  MapStubExit[];
}

export type MapExit = {
  exitId: number,
  door?: Door,
  name: MapExitName,
}

export enum Door {
  Closed = "closed",
}

export enum MapExitName {
  East = "east",
  North = "north",
  Northeast = "northeast",
  Northwest = "northwest",
  South = "south",
  Southeast = "southeast",
  Southwest = "southwest",
  West = "west",
  Wyjscie = "wyjscie",
}

export type MapStubExit = {
  name: MapExitName;
}

export type MapSymbol = {
  text: string;
}

export type MapRoomUserData = {
  vnum:    number;
  sector?: MapSector;
  s?:      MapUserDataDirection;
  se?:     MapUserDataDirection;
  e?:      MapUserDataDirection;
  n?:      MapUserDataDirection;
  ne?:     MapUserDataDirection;
  sw?:     MapUserDataDirection;
  w?:      MapUserDataDirection;
  nw?:     MapUserDataDirection;
  name?:   MapUserDataDirection;
}

export enum MapSector {
  Arena = "arena",
  ArktycznyLad = "arktyczny lad",
  Bagno = "bagno",
  BlotnaSciezka = "blotna sciezka",
  Droga = "droga",
  Eden = "eden",
  GoraceZrodla = "gorace zrodla",
  GorskaSciezka = "gorska sciezka",
  Gory = "gory",
  Jaskinia = "jaskinia",
  Jezioro = "jezioro",
  Kopalnia = "kopalnia",
  Laka = "laka",
  Las = "las",
  Lawa = "lawa",
  Lodowiec = "lodowiec",
  Miasto = "miasto",
  Morze = "morze",
  Nieuzywany = "nieuzywany",
  Ocean = "ocean",
  Park = "park",
  Plac = "plac",
  Plaza = "plaza",
  PodWoda = "pod woda",
  Podziemia = "podziemia",
  PodziemiaNaturalne = "podziemia naturalne",
  PodziemnaDroga = "podziemna droga",
  PodziemneJezioro = "podziemne jezioro",
  Pole = "pole",
  Powietrze = "powietrze",
  Pustynia = "pustynia",
  PustynnaDroga = "pustynna droga",
  Puszcza = "puszcza",
  RuchomePiaski = "ruchome piaski",
  Ruiny = "ruiny",
  Rzeka = "rzeka",
  Sawanna = "sawanna",
  Sciezka = "sciezka",
  Step = "step",
  StromaSciezka = "stroma sciezka",
  Trawa = "trawa",
  Tundra = "tundra",
  Wewnatrz = "wewnatrz",
  WodaPlyw = "woda plyw",
  Wydmy = "wydmy",
  WysGory = "wys gory",
  Wzgorza = "wzgorza",
}

export type CustomEnvColor = {
  color24RGB: number[];
  id:         number;
}

export type MapUserData = {
  type:    string;
  version: string;
}

export type MapUserDataDirection = {
  locked?: string;
  id:      number | string;
  command: string;
}

export type MapPlayerData = {[playerName: string]: number};