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
  'Abyss': 'data:image/jpeg;base64,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', // Will use fallback placeholder
  'Ascent': 'https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png', 
  'Bind': 'https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/splash.png', // Fixed UUID
  'Breeze': 'https://media.valorant-api.com/maps/2fb9a4fd-47b8-4e7d-a969-74b4046ebd53/splash.png',
  'Corrode': 'data:image/jpeg;base64,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', // Will use fallback placeholder
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