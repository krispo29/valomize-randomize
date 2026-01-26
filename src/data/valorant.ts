export type Role = 'Duelist' | 'Controller' | 'Initiator' | 'Sentinel';

export interface Agent {
  name: string;
  role: Role;
  image: string;
  color: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  pickRate?: number;
  winRate?: number;
  abilities?: {
    basic: string;
    signature: string;
    ultimate: string;
  };
}

export const AGENTS: Agent[] = [
  {
    name: "Gekko",
    role: "Initiator",
    image: "https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/displayicon.png",
    color: "#371c5c"
  },
  {
    name: "Fade",
    role: "Initiator",
    image: "https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/displayicon.png",
    color: "#1d2846"
  },
  {
    name: "Breach",
    role: "Initiator",
    image: "https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/displayicon.png",
    color: "#81331a"
  },
  {
    name: "Deadlock",
    role: "Sentinel",
    image: "https://media.valorant-api.com/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235/displayicon.png",
    color: "#425495"
  },
  {
    name: "Tejo",
    role: "Initiator",
    image: "https://media.valorant-api.com/agents/b444168c-4e35-8076-db47-ef9bf368f384/displayicon.png",
    color: "#80451b"
  },
  {
    name: "Raze",
    role: "Duelist",
    image: "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/displayicon.png",
    color: "#742e1e"
  },
  {
    name: "Chamber",
    role: "Sentinel",
    image: "https://media.valorant-api.com/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/displayicon.png",
    color: "#20435b"
  },
  {
    name: "KAY/O",
    role: "Initiator",
    image: "https://media.valorant-api.com/agents/601dbbe7-43ce-be57-2a40-4abd24953621/displayicon.png",
    color: "#1c2a69"
  },
  {
    name: "Skye",
    role: "Initiator",
    image: "https://media.valorant-api.com/agents/6f2a04ca-43e0-be17-7f36-b3908627744d/displayicon.png",
    color: "#436a51"
  },
  {
    name: "Cypher",
    role: "Sentinel",
    image: "https://media.valorant-api.com/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b/displayicon.png",
    color: "#2f5078"
  },
  {
    name: "Sova",
    role: "Initiator",
    image: "https://media.valorant-api.com/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/displayicon.png",
    color: "#355285"
  },
  {
    name: "Killjoy",
    role: "Sentinel",
    image: "https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/displayicon.png",
    color: "#522162"
  },
  {
    name: "Harbor",
    role: "Controller",
    image: "https://media.valorant-api.com/agents/95b78ed7-4637-86d9-7e41-71ba8c293152/displayicon.png",
    color: "#275146"
  },
  {
    name: "Vyse",
    role: "Sentinel",
    image: "https://media.valorant-api.com/agents/efba5359-4016-a1e5-7626-b1ae76895940/displayicon.png",
    color: "#492280"
  },
  {
    name: "Viper",
    role: "Controller",
    image: "https://media.valorant-api.com/agents/707eab51-4836-f488-046a-cda6bf494859/displayicon.png",
    color: "#1a5f46"
  },
  {
    name: "Phoenix",
    role: "Duelist",
    image: "https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/displayicon.png",
    color: "#74321c"
  },
  {
    name: "Veto",
    role: "Sentinel",
    image: "https://media.valorant-api.com/agents/92eeef5d-43b5-1d4a-8d03-b3927a09034b/displayicon.png",
    color: "#1a5d65"
  },
  {
    name: "Astra",
    role: "Controller",
    image: "https://media.valorant-api.com/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/displayicon.png",
    color: "#26146c"
  },
  {
    name: "Brimstone",
    role: "Controller",
    image: "https://media.valorant-api.com/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/displayicon.png",
    color: "#363c4f"
  },
  {
    name: "Iso",
    role: "Duelist",
    image: "https://media.valorant-api.com/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c/displayicon.png",
    color: "#30336e"
  },
  {
    name: "Clove",
    role: "Controller",
    image: "https://media.valorant-api.com/agents/1dbf2edd-4729-0984-3115-daa5eed44993/displayicon.png",
    color: "#4b1d80"
  },
  {
    name: "Neon",
    role: "Duelist",
    image: "https://media.valorant-api.com/agents/bb2a4828-46eb-8cd1-e765-15848195d751/displayicon.png",
    color: "#413476"
  },
  {
    name: "Yoru",
    role: "Duelist",
    image: "https://media.valorant-api.com/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89/displayicon.png",
    color: "#222b67"
  },
  {
    name: "Waylay",
    role: "Duelist",
    image: "https://media.valorant-api.com/agents/df1cb487-4902-002e-5c17-d28e83e78588/displayicon.png",
    color: "#482e61"
  },
  {
    name: "Sage",
    role: "Sentinel",
    image: "https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/displayicon.png",
    color: "#1f5148"
  },
  {
    name: "Reyna",
    role: "Duelist",
    image: "https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/displayicon.png",
    color: "#662d62"
  },
  {
    name: "Omen",
    role: "Controller",
    image: "https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/displayicon.png",
    color: "#433178"
  },
  {
    name: "Jett",
    role: "Duelist",
    image: "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png",
    color: "#25607a"
  }
];

export const DEFAULT_FRIENDS = [
  "Mike", "Si", "Sunny", "Nut", "Do"
];

export type ValorantMap = 'Abyss' | 'Ascent' | 'Bind' | 'Breeze' | 'Corrode' | 'Fracture' | 'Haven' | 'Icebox' | 'Lotus' | 'Pearl' | 'Split' | 'Sunset';

export const MAPS: ValorantMap[] = ['Abyss', 'Ascent', 'Bind', 'Breeze', 'Corrode', 'Fracture', 'Haven', 'Icebox', 'Lotus', 'Pearl', 'Split', 'Sunset'];

// Optimized: Use external URLs instead of base64 images
export const MAP_IMAGES: Record<ValorantMap, string> = {
  'Abyss': '/maps/Abyss.jpg', // Will use fallback placeholder
  'Ascent': 'https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png', 
  'Bind': 'https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/splash.png', // Fixed UUID
  'Breeze': 'https://media.valorant-api.com/maps/2fb9a4fd-47b8-4e7d-a969-74b4046ebd53/splash.png',
  'Corrode': '/maps/Corrode.jpg', // Will use fallback placeholder
  'Fracture': 'https://media.valorant-api.com/maps/b529448b-4d60-346e-e89e-00a4c527a405/splash.png',
  'Haven': 'https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png',
  'Icebox': 'https://media.valorant-api.com/maps/e2ad5c54-4114-a870-9641-8ea21279579a/splash.png', // Fixed UUID
  'Lotus': 'https://media.valorant-api.com/maps/2fe4ed3a-450a-948b-6d6b-e89a78e680a9/splash.png',
  'Pearl': 'https://media.valorant-api.com/maps/fd267378-4d1d-484f-ff52-77821ed10dc2/splash.png',
  'Split': 'https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/splash.png',
  'Sunset': 'https://media.valorant-api.com/maps/92584fbe-486a-b1b2-9faa-39b0f486b498/splash.png'
};

// Fallback function to get map image with placeholder if not available
export const getMapImage = (map: ValorantMap): string => {
  if (MAP_IMAGES[map]) {
    return MAP_IMAGES[map];
  }
  
  // Generate a placeholder SVG with the map name
  const svgPlaceholder = `
    <svg width="400" height="225" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1a1a2e"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="#eee" text-anchor="middle" dy=".3em">
        ${map}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svgPlaceholder)}`;
};

export interface MapRoleComposition {
  duelists: number;
  controllers: number;
  initiators: number;
  sentinels: number;
}

// Composition Numbers: Based on Optimal Pro Play/High Elo Meta 2025-2026
// บางด่านปรับเป็น 1 Duelist / 2 Initiator หรือ 2 Controller ตาม Meta
export const MAP_ROLE_COMPOSITION: Record<ValorantMap, MapRoleComposition> = {
  'Abyss':    { duelists: 2, controllers: 1, initiators: 1, sentinels: 1 },
  'Ascent':   { duelists: 1, controllers: 1, initiators: 2, sentinels: 1 },
  'Bind':     { duelists: 1, controllers: 2, initiators: 1, sentinels: 1 },
  'Breeze':   { duelists: 1, controllers: 2, initiators: 1, sentinels: 1 },
  'Corrode':  { duelists: 2, controllers: 1, initiators: 1, sentinels: 1 },
  'Fracture': { duelists: 1, controllers: 1, initiators: 2, sentinels: 1 },
  'Haven':    { duelists: 2, controllers: 1, initiators: 1, sentinels: 1 },
  'Icebox':   { duelists: 1, controllers: 1, initiators: 2, sentinels: 1 },
  'Lotus':    { duelists: 1, controllers: 1, initiators: 2, sentinels: 1 },
  'Pearl':    { duelists: 2, controllers: 1, initiators: 1, sentinels: 1 },
  'Split':    { duelists: 2, controllers: 1, initiators: 1, sentinels: 1 },
  'Sunset':   { duelists: 1, controllers: 1, initiators: 2, sentinels: 1 }
};

// Meta Agents for each map (2025-2026 VCT/High-Tier Meta)
// Updated to include at least 3 viable options per role.
export const MAP_META_AGENTS: Record<ValorantMap, { 
  duelists: string[], 
  controllers: string[], 
  initiators: string[], 
  sentinels: string[] 
}> = {
  'Abyss': {
    duelists: ['Jett', 'Neon', 'Waylay'],
    controllers: ['Omen', 'Astra', 'Harbor'],
    initiators: ['Sova', 'KAY/O', 'Fade'],
    sentinels: ['Cypher', 'Veto', 'Deadlock']
  },
  'Ascent': { // Standard Comp, inferred as stable
    duelists: ['Jett', 'Raze', 'Phoenix', 'Reyna'],
    controllers: ['Omen', 'Astra', 'Clove', 'Brimstone'],
    initiators: ['Sova', 'KAY/O', 'Fade', 'Gekko'],
    sentinels: ['Killjoy', 'Cypher', 'Vyse', 'Chamber']
  },
  'Bind': {
    duelists: ['Raze', 'Neon', 'Phoenix'],
    controllers: ['Brimstone', 'Viper', 'Omen'],
    initiators: ['Skye', 'Gekko', 'Tejo'],
    sentinels: ['Cypher', 'Sage', 'Veto']
  },
  'Breeze': {
    duelists: ['Jett', 'Yoru', 'Reyna'],
    controllers: ['Viper', 'Harbor', 'Astra'],
    initiators: ['Sova', 'KAY/O', 'Skye'],
    sentinels: ['Cypher', 'Chamber', 'Veto']
  },
  'Corrode': { 
    duelists: ['Waylay', 'Yoru', 'Neon'],
    controllers: ['Omen', 'Viper', 'Clove'],
    initiators: ['Fade', 'Sova', 'Tejo'],
    sentinels: ['Cypher', 'Vyse', 'Deadlock']
  },
  'Fracture': { // Unchanged in report, keeping defaults
    duelists: ['Neon', 'Raze', 'Jett', 'Yoru'],
    controllers: ['Brimstone', 'Harbor', 'Viper', 'Omen'],
    initiators: ['Breach', 'Fade', 'Gekko', 'KAY/O'],
    sentinels: ['Killjoy', 'Cypher', 'Chamber', 'Deadlock']
  },
  'Haven': {
    duelists: ['Jett', 'Neon', 'Phoenix'],
    controllers: ['Omen', 'Astra', 'Clove'],
    initiators: ['Breach', 'Sova', 'Fade'],
    sentinels: ['Killjoy', 'Cypher', 'Veto']
  },
  'Icebox': { // Unchanged
    duelists: ['Jett', 'Reyna', 'Yoru', 'Iso'],
    controllers: ['Viper', 'Harbor', 'Omen', 'Clove'],
    initiators: ['Sova', 'Gekko', 'KAY/O', 'Fade'],
    sentinels: ['Killjoy', 'Sage', 'Deadlock', 'Chamber']
  },
  'Lotus': { // Unchanged
    duelists: ['Raze', 'Neon', 'Jett', 'Phoenix'],
    controllers: ['Omen', 'Viper', 'Astra', 'Harbor'],
    initiators: ['Fade', 'Breach', 'Gekko', 'Skye'],
    sentinels: ['Killjoy', 'Cypher', 'Deadlock', 'Vyse']
  },
  'Pearl': {
    duelists: ['Jett', 'Neon', 'Phoenix'],
    controllers: ['Astra', 'Viper', 'Harbor'],
    initiators: ['Fade', 'KAY/O', 'Gekko'],
    sentinels: ['Veto', 'Killjoy', 'Cypher']
  },
  'Split': {
    duelists: ['Raze', 'Jett', 'Waylay'],
    controllers: ['Omen', 'Viper', 'Astra'],
    initiators: ['Skye', 'Breach', 'Tejo'],
    sentinels: ['Sage', 'Cypher', 'Veto']
  },
  'Sunset': { // Unchanged
    duelists: ['Raze', 'Neon', 'Jett', 'Phoenix'],
    controllers: ['Omen', 'Astra', 'Harbor', 'Clove'],
    initiators: ['Gekko', 'Breach', 'Fade', 'Sova'],
    sentinels: ['Cypher', 'Deadlock', 'Vyse', 'Sage']
  }
};
export const MAP_META: Record<string, string[]> = Object.fromEntries(
  Object.entries(MAP_META_AGENTS).map(([map, roles]) => [
    map,
    Array.from(new Set([...roles.duelists, ...roles.controllers, ...roles.initiators, ...roles.sentinels]))
  ])
);