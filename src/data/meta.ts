import { type Role, type ValorantMap } from './valorant';

export type TierRank = 'S' | 'A' | 'B';
export type PickRateTrend = 'Rising' | 'Stable' | 'Falling';

export interface AgentStrategyProfile {
  name: string;
  tier: TierRank;
  pickRateTrend?: PickRateTrend;
  strategicReasoning: string;
  keyInteractions: string[];
  synergies?: string[];
}

export interface MapMetaConfiguration {
  mapName: ValorantMap;
  topographyType: string;
  metaArchetype: string;
  roleComposition: Partial<Record<Role, AgentStrategyProfile[]>>;
}

export const valorantMeta2026: MapMetaConfiguration[] = [
  {
    mapName: 'Abyss',
    topographyType: 'High verticality / Open death drops / Long mid-range',
    metaArchetype: 'Vertical Mobility & Long-Range Info',
    roleComposition: {
      'Duelist': [
        {
          name: 'Jett',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Updraft accesses vertical off-angles; Tailwind crosses jump shortcuts safely.',
          keyInteractions: ['Hover over death drops for info', 'Operator usage on long lines'],
          synergies: ['Sova', 'Omen']
        },
        {
          name: 'Neon',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Rotation speed on large map is unmatched; Slide evades shots on long bridges.',
          keyInteractions: ['Relay Bolt on B-Site bridge', 'High Gear rotations'],
          synergies: ['Breach', 'KAY/O']
        },
        {
          name: 'Waylay',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Multi-directional dash allows safe peeking of long angles; Refract baits OPs.',
          keyInteractions: ['Refract decoy on A-Main', 'Light Speed lateral dash']
        },
        {
          name: 'Iso',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Double Tap shield counters Operator dominance on long sightlines.',
          keyInteractions: ['Dry peeking Mid w/ Shield', 'Undercut on jump-ups'],
          synergies: ['Sova', 'Omen']
        }
      ],
      'Initiator': [
        {
          name: 'Sova',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'High skybox allows cross-map recons; Owl Drone clears corners near death drops.',
          keyInteractions: ['Recon Bolt from spawn', 'Hunters Fury in narrow bridges'],
          synergies: ['Jett', 'Deadlock']
        },
        {
          name: 'KAY/O',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Suppression causes environmental deaths for Jett/Raze over gaps.',
          keyInteractions: ['Knife hitting Jett mid-updraft', 'Flash-pop for long range peeks'],
          synergies: ['Neon', 'Raze']
        },
        {
          name: 'Fade',
          tier: 'B',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Prowlers clear library/vent areas; Nightfall covers entire B-Site.',
          keyInteractions: ['Seize on bridge choke points'],
          synergies: ['Raze']
        }
      ],
      'Controller': [
        {
          name: 'Omen',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Shrouded Step allows vertical movement similar to Jett; Paranoia covers A-Main lanes.',
          keyInteractions: ['Teleport to high ground', 'One-way smokes'],
          synergies: ['Jett', 'Cypher']
        },
        {
          name: 'Astra',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Global star placement; Gravity Well lethal near death drops.',
          keyInteractions: ['Pulling enemies off the map', 'Fake nebula pressure']
        },
        {
          name: 'Harbor',
          tier: 'B',
          pickRateTrend: 'Rising',
          strategicReasoning: 'High Tide covers vertical angles spherical smokes miss.',
          keyInteractions: ['Cove protecting bridge plant', 'Cascade pushing A-Main']
        }
      ],
      'Sentinel': [
        {
          name: 'Cypher',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Global info passive mandatory for flank routes; Unbreakable trips on bridges.',
          keyInteractions: ['Spycam high placements', 'Tripwires on bridge'],
          synergies: ['Omen', 'Sova']
        },
        {
          name: 'Chamber',
          tier: 'S',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Trademark buffer removal allows global flank watch; Headhunter dominates long sightlines.',
          keyInteractions: ['Holding mid-air angles with TP', 'Oping on A-Main'],
          synergies: ['Jett', 'Sova']
        },
        {
          name: 'Veto',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Interceptor neutralizes Sova/KAY/O util on open plant sites.',
          keyInteractions: ['Interceptor on plant spot', 'Chokehold on jump-ups']
        },
        {
          name: 'Deadlock',
          tier: 'B',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Barrier Mesh blocks narrow bridges effectively.',
          keyInteractions: ['GravNet forcing crouch-walk', 'Wall blocking bridge'],
          synergies: ['Raze', 'Sova']
        }
      ]
    }
  },
  {
    mapName: 'Bind',
    topographyType: 'Teleporters / No Mid / Narrow Chokes',
    metaArchetype: 'Heavy Execute & Space Denial',
    roleComposition: {
      'Duelist': [
        {
          name: 'Raze',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Paint Shells/Boom Bot clear Hookah/Lamps corners; Satchel entry.',
          keyInteractions: ['Showstopper in Showers', 'Nade stacking Lamps'],
          synergies: ['Fade', 'Viper']
        },
        {
          name: 'Neon',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Fast rotates via TPs; High Gear floods sites.',
          keyInteractions: ['Slide into Hookah', 'Relay Bolt U-Hall'],
          synergies: ['Breach', 'Skye']
        },
        {
          name: 'Phoenix',
          tier: 'B',
          pickRateTrend: 'Falling',
          strategicReasoning: 'Flash effective in tight corners; Ult safe for TP plays.',
          keyInteractions: ['Run it Back through TP', 'Curveball Lamps']
        }
      ],
      'Initiator': [
        {
          name: 'Skye',
          tier: 'S',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Trailblazer essential for clearing Hookah; Guiding Light pop-flashes.',
          keyInteractions: ['Dog clearing Hookah', 'Flash out of smokes'],
          synergies: ['Raze', 'Viper']
        },
        {
          name: 'Gekko',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Wingman plant on B while team fights from Window; Dizzy info on Short.',
          keyInteractions: ['Wingman plant B', 'Thrash (Ult) retake']
        },
        {
          name: 'Tejo',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Guided Salvo clears U-Hall and back-site rats; Drone suppresses Viper walls.',
          keyInteractions: ['Salvo clearing Elbow', 'Drone TP entry']
        }
      ],
      'Controller': [
        {
          name: 'Brimstone',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Instant Sky Smokes for fast rushes; Orbital Strike post-plant.',
          keyInteractions: ['Molly lineups', 'Stim Beacon rush'],
          synergies: ['Raze', 'Gekko']
        },
        {
          name: 'Viper',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Wall cuts B site; Snake bites combo with Raze nades.',
          keyInteractions: ['One-way on A-Short', 'Vipers Pit A-Lamps'],
          synergies: ['Raze', 'Skye']
        },
        {
          name: 'Omen',
          tier: 'B',
          pickRateTrend: 'Falling',
          strategicReasoning: 'One-ways on Short/Hookah are strong defensive tools.',
          keyInteractions: ['TP into Hookah', 'Paranoia Garden']
        }
      ],
      'Sentinel': [
        {
          name: 'Cypher',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Trips difficult to clear; Camera gives vital info.',
          keyInteractions: ['Camera B-Hookah', 'Cage one-ways'],
          synergies: ['Brimstone', 'Viper']
        },
        {
          name: 'Sage',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Barrier Orb critical for B-Tube plant; Slows stop Hookah rush.',
          keyInteractions: ['Wall off Showers', 'Slow Orb Hookah']
        },
        {
          name: 'Chamber',
          tier: 'B',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Teleport allows aggression in Showers/Hookah; Headhunter eco rounds.',
          keyInteractions: ['Aggressive peek Showers', 'TP to backsite'],
          synergies: ['Brimstone']
        },
        {
          name: 'Veto',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Interceptor in Hookah/Showers stops Raze nades.',
          keyInteractions: ['Chokehold on TP exit', 'Interceptor Hookah']
        }
      ]
    }
  },
  {
    mapName: 'Breeze',
    topographyType: 'Massive / Long Range / Open Mid',
    metaArchetype: 'Aim Duel & Line-of-Sight Blockers',
    roleComposition: {
      'Duelist': [
        {
          name: 'Jett',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Dash essential for Operator lines; Cloudburst crosses A-Pyramids.',
          keyInteractions: ['Operator on A-Main', 'Dash entry']
        },
        {
          name: 'Yoru',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Instant rotates via TP; Clone clears A-Main OP angles.',
          keyInteractions: ['Gatecrash rotate', 'Clone baiting OP']
        },
        {
          name: 'Reyna',
          tier: 'B',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Dismiss allows taking long-range 50/50 fights safely.',
          keyInteractions: ['Leer in open sites', 'Dismiss to safety']
        }
      ],
      'Initiator': [
        {
          name: 'Sova',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Recon Bolt scans entire sites; Owl Drone clears A-Main for Jett.',
          keyInteractions: ['Recon A-Site back', 'Hunters Fury Halls']
        },
        {
          name: 'KAY/O',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Suppression disables enemy Viper walls.',
          keyInteractions: ['Knife Viper setup', 'Ult site execute']
        },
        {
          name: 'Skye',
          tier: 'B',
          pickRateTrend: 'Falling',
          strategicReasoning: 'Dog clears close angles; Flash supports OP player.',
          keyInteractions: ['Guiding Light long range', 'Seekers in late round']
        }
      ],
      'Controller': [
        {
          name: 'Viper',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Toxic Screen vital for crossing A-Cave/B-Main; Vipers Pit on A.',
          keyInteractions: ['Wall covering Mid', 'Rat pit on A']
        },
        {
          name: 'Harbor',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Cove allows planting in open; Cascade pushes space.',
          keyInteractions: ['high Tide wall', 'Cove plant']
        },
        {
          name: 'Astra',
          tier: 'B',
          pickRateTrend: 'Falling',
          strategicReasoning: 'Global presence but lower uptime than Viper.',
          keyInteractions: ['Gravity Well stop plant', 'Recall fake']
        }
      ],
      'Sentinel': [
        {
          name: 'Cypher',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Cam/Trips hold Mid/Halls autonomously.',
          keyInteractions: ['Unbreakable trip A-Halls', 'Spycam Mid']
        },
        {
          name: 'Chamber',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Headhunter/Tour De Force dominate long ranges.',
          keyInteractions: ['OP off-angles', 'TP escape']
        },
        {
          name: 'Veto',
          tier: 'B',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Holds chokes against flash executes.',
          keyInteractions: ['Interceptor B-Main', 'Evolution clutch']
        }
      ]
    }
  },
  {
    mapName: 'Corrode',
    topographyType: 'Medieval / Tight Corners / 3 Lanes',
    metaArchetype: 'Tactical Gunplay & Skirmish',
    roleComposition: {
      'Duelist': [
        {
          name: 'Waylay',
          tier: 'S',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Refract decoy shines in mid-range skirmishes; Saturate hinders within narrow corridors.',
          keyInteractions: ['Dash cross Mid', 'Saturate narrow choke']
        },
        {
          name: 'Yoru',
          tier: 'S',
          pickRateTrend: 'Rising',
          strategicReasoning: 'TP lineups punish long rotations; Clones confuse in 3-lane layout.',
          keyInteractions: ['Flash off masonry walls', 'Lurk TP']
        },
        {
          name: 'Neon',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Corridors suit movement speed; Relay bolt opens sites.',
          keyInteractions: ['Fast Lane dissecting site', 'Rotation speed']
        },
        {
          name: 'Iso',
          tier: 'B',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Shield excels in isolated 1v1 aim duels inherent to the map.',
          keyInteractions: ['Shielded entry on B', 'Kill Contract in tight lanes']
        }
      ],
      'Initiator': [
        {
          name: 'Fade',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Prowlers navigate jagged corners better than Drone; Seize traps in small chokes.',
          keyInteractions: ['Prowler clearing mines', 'Seize nade combo']
        },
        {
          name: 'Sova',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'High wall-bang potential on mining structures.',
          keyInteractions: ['Wallbang A-Main', 'Shock Dart cubbies']
        },
        {
          name: 'Tejo',
          tier: 'B',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Drone excellent for clearing masonry corners.',
          keyInteractions: ['Salvo flush B-Site', 'Drone Mid']
        }
      ],
      'Controller': [
        {
          name: 'Omen',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Paranoia covers wide lanes; TP to castle walls.',
          keyInteractions: ['Paranoia main lane', 'Vertical TP']
        },
        {
          name: 'Viper',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Toxic Screen vital for Mid control.',
          keyInteractions: ['Wall off rotation', 'Pit B-Site']
        },
        {
          name: 'Clove',
          tier: 'B',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Aggressive playstyle fits skirmish nature.',
          keyInteractions: ['Post-death smoke A', 'Overheal push']
        }
      ],
      'Sentinel': [
        {
          name: 'Cypher',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Trips effective if placed to avoid wallbangs.',
          keyInteractions: ['Lock down B-Site', 'Mid info']
        },
        {
          name: 'Vyse',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Razor Vine/Flashes excellent for narrow A-Main chokes.',
          keyInteractions: ['Isolate 1v1', 'Arc Rose flash']
        },
        {
          name: 'Deadlock',
          tier: 'B',
          pickRateTrend: 'Falling',
          strategicReasoning: 'GravNet devastating in narrow lanes.',
          keyInteractions: ['Sonic Sensor Mid flank', 'Barrier Mesh choke']
        }
      ]
    }
  },
  {
    mapName: 'Haven',
    topographyType: '3 Sites / Spread Defense / Rotations',
    metaArchetype: 'Retake & Flexibility',
    roleComposition: {
      'Duelist': [
        {
          name: 'Jett',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Operator critical for C-Long/A-Long; Dash entry C-Site.',
          keyInteractions: ['OP C-Long', 'Smoke Dash Entry']
        },
        {
          name: 'Neon',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Fast rotates between 3 sites.',
          keyInteractions: ['High Gear rotate', 'Slide Garage']
        },
        {
          name: 'Phoenix',
          tier: 'B',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Flash/Molly strong in Garage/C-Short.',
          keyInteractions: ['Farm C-Orb', 'Flash Garage']
        }
      ],
      'Initiator': [
        {
          name: 'Breach',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Fault Line covers Long approaches; Rolling Thunder retakes/executes.',
          keyInteractions: ['Stun C-Long', 'Aftershock Garage']
        },
        {
          name: 'Sova',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Drone/Recon vital for early info and retakes.',
          keyInteractions: ['Late round recon', 'Hunters Fury C-Default']
        },
        {
          name: 'Fade',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Seize/Nade combo strong in Garage.',
          keyInteractions: ['Haunt A-Site', 'Seize Garage']
        }
      ],
      'Controller': [
        {
          name: 'Omen',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Regenerative smokes superior for 3 sites; Paranoia retake.',
          keyInteractions: ['Flash A-Short', 'TP on boxes']
        },
        {
          name: 'Astra',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Recallable stars adapt to 3-site rotations.',
          keyInteractions: ['Global support', 'Gravity Well C-Long']
        },
        {
          name: 'Clove',
          tier: 'B',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Post-death smokes valuable for solo anchoring.',
          keyInteractions: ['Smoke Garage after death', 'Resurrection']
        }
      ],
      'Sentinel': [
        {
          name: 'Killjoy',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Turret watches C-Long/Garage autonomously.',
          keyInteractions: ['Lockdown A/C Site', 'Turret Garage']
        },
        {
          name: 'Cypher',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'One-way cages on A-Short/C-Long.',
          keyInteractions: ['Camera C-Garage', 'Trapwires A-Short']
        },
        {
          name: 'Chamber',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Can hold C-Long or A-Long with Operator effectively; Trademark holds Garage flank.',
          keyInteractions: ['Op hold C-Long', 'TP to elevated positions'],
          synergies: ['Jett']
        },
        {
          name: 'Veto',
          tier: 'B',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Trap locks down Garage pivot point.',
          keyInteractions: ['Chokehold Garage', 'Interceptor A-Site']
        }
      ]
    }
  },
  {
    mapName: 'Pearl',
    topographyType: 'B-Long Dominance / Spam Heavy',
    metaArchetype: 'Map Control & Post-Plant',
    roleComposition: {
      'Duelist': [
        {
          name: 'Jett',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Essential for B-Long Operator battle.',
          keyInteractions: ['OP B-Long', 'Dash entry']
        },
        {
          name: 'Neon',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Threatens A-Main/Art to relieve B pressure.',
          keyInteractions: ['Speed A-Main', 'Slide past OP']
        },
        {
          name: 'Phoenix',
          tier: 'B',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Farming orbs and fighting Art/Connector.',
          keyInteractions: ['Wall B-Site', 'Flash Art']
        }
      ],
      'Initiator': [
        {
          name: 'Fade',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Prowlers clear Art/A-Main; Haunt reveals B-Long.',
          keyInteractions: ['Seize B-Halls', 'Haunt Roofs']
        },
        {
          name: 'KAY/O',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Suppresses B-site sentinels for free plants.',
          keyInteractions: ['Knife B-Site', 'Fragment Default']
        },
        {
          name: 'Gekko',
          tier: 'B',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Wingman plant on B allows team to hold Long.',
          keyInteractions: ['Wingman plant B', 'Dizzy A-Main']
        }
      ],
      'Controller': [
        {
          name: 'Astra',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Best controller; Cosmic Divide blocks B-Long OP.',
          keyInteractions: ['Smoke B-Long', 'Wall Ult']
        },
        {
          name: 'Viper',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Wall cuts B-site sightlines.',
          keyInteractions: ['Screen B-Site', 'Post-plant mollies']
        },
        {
          name: 'Harbor',
          tier: 'B',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Cove/High Tide enable safe B plants.',
          keyInteractions: ['Cove B-Default', 'Wall B-Long']
        }
      ],
      'Sentinel': [
        {
          name: 'Veto',
          tier: 'S',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Interceptor neutralizes Sova/KAY/O util on B-Default plant.',
          keyInteractions: ['Block lineups', 'Hold B-Long']
        },
        {
          name: 'Chamber',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Best B-Long holder alongside Jett; Trademark watches Art/Mid.',
          keyInteractions: ['Op battle B-Long', 'TP behind screen'],
          synergies: ['Jett', 'Astra']
        },
        {
          name: 'Killjoy',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Lockdown guarantees B-site retake.',
          keyInteractions: ['Turret Art', 'Nanoswarm Default']
        },
        {
          name: 'Cypher',
          tier: 'B',
          pickRateTrend: 'Falling',
          strategicReasoning: 'Cages/Trips hold A-site/Art solo.',
          keyInteractions: ['Camera B-Long', 'Cage A-Main']
        }
      ]
    }
  },
  {
    mapName: 'Split',
    topographyType: 'Mid Control / Ropes / Defensive Sided',
    metaArchetype: 'Stall & Mid Siege',
    roleComposition: {
      'Duelist': [
        {
          name: 'Raze',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Paint Shells clear Mid Vents/Mail instantly; Satchels to Heaven.',
          keyInteractions: ['Nade Vents', 'Showstopper A-Site']
        },
        {
          name: 'Jett',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Dash crosses Mid chokes safely.',
          keyInteractions: ['OP Mid-Vent', 'Updraft A-Heaven']
        },
        {
          name: 'Waylay',
          tier: 'B',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Saturate slows pushes in narrow Heaven/Ramps.',
          keyInteractions: ['Dash Mid', 'Refract bait']
        }
      ],
      'Initiator': [
        {
          name: 'Skye',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Flashes unavoidable in narrow corridors.',
          keyInteractions: ['Dog B-Garage', 'Flash A-Main']
        },
        {
          name: 'Breach',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Stuns cover entire ramps/entrances.',
          keyInteractions: ['Faultline A-Ramp', 'Aftershock Elbow']
        },
        {
          name: 'Tejo',
          tier: 'B',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Clears corners in A/B Heaven pushes.',
          keyInteractions: ['Salvo Rafters', 'Drone Vents']
        }
      ],
      'Controller': [
        {
          name: 'Omen',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'One-ways on A-Main/B-Main are oppressive.',
          keyInteractions: ['One-way A-Main', 'Paranoia B-Site']
        },
        {
          name: 'Viper',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Secondary controller to wall Mid/Ramps.',
          keyInteractions: ['Wall A-Ramps', 'Pit Mid']
        },
        {
          name: 'Astra',
          tier: 'B',
          pickRateTrend: 'Falling',
          strategicReasoning: 'Gravity Well stops rushes in chokes.',
          keyInteractions: ['Suck A-Main', 'Smoke Mid']
        }
      ],
      'Sentinel': [
        {
          name: 'Sage',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Wall on Mid denies info; Slows stop rushes.',
          keyInteractions: ['Wall Mid', 'Slow Ramps']
        },
        {
          name: 'Cypher',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Trips in Heaven/Ramps prevent flanks.',
          keyInteractions: ['Cage B-Site', 'Trip Heaven']
        },
        {
          name: 'Veto',
          tier: 'B',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Kit holds tight chokes against Raze util.',
          keyInteractions: ['Interceptor Vents', 'Trap B-Main']
        }
      ]
    }
  },
  {
    mapName: 'Summit',
    topographyType: 'Dynamic Interactive Walls / Vertical Mid-Lane / Tight Corridors',
    metaArchetype: 'Mid Dominance & Reactive Choke Control',
    roleComposition: {
      'Duelist': [
        {
          name: 'Raze',
          tier: 'S',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Boombot and Paint Shells flush tight corridors; Satchels allow vertical jumps over dropped walls.',
          keyInteractions: ['Paint Shells in Fountain/Bend chokes', 'Satchel entry over dynamic walls'],
          synergies: ['Fade', 'Omen']
        },
        {
          name: 'Neon',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Fast Lane slices through open Mid lanes; Slide evades crossfires across dynamic wall openings.',
          keyInteractions: ['Fast Lane through Mid tiles', 'Relay Bolt into B Drop'],
          synergies: ['Breach', 'Cypher']
        },
        {
          name: 'Phoenix',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Curveballs are nearly undodgeable in narrow corridors; Blaze wall acts as mobile cover around wall switches.',
          keyInteractions: ['Run It Back push on A-Main', 'Hot Hands self-heal in post-plant'],
          synergies: ['Omen', 'Sage']
        },
        {
          name: 'Waylay',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Refract decoy misdirects defenders watching narrow wall choke-points; Saturate slows rotations.',
          keyInteractions: ['Refract decoy on A Link', 'Light Speed lateral repositioning'],
          synergies: ['Sova', 'Vyse']
        }
      ],
      'Controller': [
        {
          name: 'Omen',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Paranoia covers wide Mid chokepoints; Dark Cover blocks sightlines across Fountain/Window; Shrouded Step crosses wall gaps.',
          keyInteractions: ['One-way smokes on A-Art', 'Shrouded Step over interactive wall obstacles'],
          synergies: ['Raze', 'Cypher']
        },
        {
          name: 'Miks',
          tier: 'S',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Harmonize combat stim powers fast team site entries; M-Pulse heal sustains long mid-round holds; Bassquake clears tight sites.',
          keyInteractions: ['Harmonize with Raze/Neon on site execute', 'M-Pulse heal during post-plant defense'],
          synergies: ['Raze', 'Sage']
        },
        {
          name: 'Viper',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Toxic Screen slices through Mid and A-Site; Poison Cloud locks down A-Cave or B-Main.',
          keyInteractions: ['Toxic Screen through Fountain & Mid', 'Viper Pit on B-Site lockdown'],
          synergies: ['Cypher', 'Sova']
        },
        {
          name: 'Clove',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Meddle decay combines with team utility at wall chokes; post-death smokes ensure mid-control even after opening duels.',
          keyInteractions: ['Pick-Me-Up speed boost through Mid', 'Post-mortem smokes on B Tower'],
          synergies: ['Neon', 'Fade']
        }
      ],
      'Initiator': [
        {
          name: 'Sova',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Recon Bolt maps out Fountain and Main before walls drop; Owl Drone clears dangerous 50/50 corners; Hunter Fury punishes wall traps.',
          keyInteractions: ['Recon Bolt into Mid Tiles', 'Hunters Fury on B-Default plant'],
          synergies: ['Cypher', 'Omen']
        },
        {
          name: 'Fade',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Haunt exposes entrenched site defenders; Prowlers track down enemies in narrow Cave and Gym; Nightfall guarantees retakes.',
          keyInteractions: ['Prowler tracking through Mid-Bend', 'Seize combo with Raze grenade'],
          synergies: ['Raze', 'Miks']
        },
        {
          name: 'Breach',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Fault Line concusses long corridor lines in A-Hall and B-Main; Flashpoint through interactive walls creates free kills.',
          keyInteractions: ['Aftershock clearing corner rat spots', 'Rolling Thunder covering full A-Site'],
          synergies: ['Neon', 'Cypher']
        },
        {
          name: 'KAY/O',
          tier: 'B',
          pickRateTrend: 'Stable',
          strategicReasoning: 'ZERO/POINT suppression blade prevents enemies from activating wall switches and neutralizes Sentinel setups.',
          keyInteractions: ['Knife suppression on A-Site anchor', 'FRAG/ment zoning on spike'],
          synergies: ['Raze', 'Sova']
        }
      ],
      'Sentinel': [
        {
          name: 'Sage',
          tier: 'S',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Barrier Wall stacks with interactive walls to completely re-route attackers; Slow Orbs stall pushes at narrow corridor chokes.',
          keyInteractions: ['Wall-stacking on B-Link', 'Slow Orb stalling through Fountain'],
          synergies: ['Cypher', 'Omen']
        },
        {
          name: 'Cypher',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Trapwires secure multiple flank routes (Cave, Gym, Trophy); Spycam provides permanent vision over Mid Fountain without risk.',
          keyInteractions: ['Unbreakable trips on B-Drop', 'Cyber Cage cross-choke one-ways'],
          synergies: ['Sova', 'Omen']
        },
        {
          name: 'Vyse',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Shear wall isolates attackers committing to tight chokepoints; Arc Rose flashes through walls; Steel Garden disarms pushes.',
          keyInteractions: ['Shear isolation trap on A-Main entry', 'Steel Garden disarm on retake'],
          synergies: ['Raze', 'Miks']
        },
        {
          name: 'Veto',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Interceptor destroys incoming recon darts and mollies on site; Chokehold trap deafens and decays tight corridor pushes.',
          keyInteractions: ['Interceptor trophy guarding default plant', 'Chokehold on B-Trophy flank'],
          synergies: ['Sage', 'Fade']
        }
      ]
    }
  },
  {
    mapName: 'Ascent',
    topographyType: 'Open Courtyard Mid / Standard Two-Site / Destructible Doors',
    metaArchetype: 'Courtyard Mid Dominance & Retake Anchoring',
    roleComposition: {
      'Duelist': [
        {
          name: 'Jett',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Operator dominance in Mid Courtyard; Tailwind entry past B-Main and A-Main chokes.',
          keyInteractions: ['Mid Operator pick into Catwalk', 'Dash-smoke entry onto A-Site'],
          synergies: ['Sova', 'Omen']
        },
        {
          name: 'Phoenix',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Run It Back clears out close angles on A/B; Curveball flashes through door chokes; Wall provides fast mid cross.',
          keyInteractions: ['Curveball through A-Tree door', 'Blaze wall across Mid Courtyard'],
          synergies: ['Clove', 'KAY/O']
        },
        {
          name: 'Reyna',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Dismiss allows safe peeking of Mid and A-Main; Leer blinds long lines.',
          keyInteractions: ['Leer over B-Main wall', 'Empress site takeover'],
          synergies: ['Omen', 'Fade']
        },
        {
          name: 'Waylay',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Refract hologram baits Operator shots from Mid Courtyard; Light Speed allows fluid repositioning across Market.',
          keyInteractions: ['Refract decoy peeking Mid Top', 'Saturate debuff on Catwalk rushers'],
          synergies: ['Sova', 'Killjoy']
        }
      ],
      'Controller': [
        {
          name: 'Clove',
          tier: 'S',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Top statistical winrate on Ascent; self-sustain and post-death smokes keep Mid smoked even if traded early.',
          keyInteractions: ['Post-mortem smoke on Mid Catwalk & Tree', 'Pick-Me-Up overheal after Mid duel'],
          synergies: ['Jett', 'Sova']
        },
        {
          name: 'Omen',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Paranoia covers all of B-Main and A-Main; hollow smokes allow one-ways at Catwalk and A-Main.',
          keyInteractions: ['Paranoia through A-Tree', 'One-way smoke on A-Main and B-Main'],
          synergies: ['Jett', 'Killjoy']
        },
        {
          name: 'Astra',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Global pull and concuss disrupt executes on both sites; Astral Form allows smoking Catwalk from anywhere.',
          keyInteractions: ['Gravity Well on B-Lane entry', 'Cosmic Divide splitting A-Site'],
          synergies: ['Sova', 'Cypher']
        },
        {
          name: 'Miks',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Waveform smokes isolate Mid-Market; Harmonize combat stim enhances spray control in Courtyard duels; M-Pulse heals chip damage.',
          keyInteractions: ['Harmonize with Jett Operator/Vandal', 'Bassquake flushing out Wine on A-Site'],
          synergies: ['Phoenix', 'Killjoy']
        }
      ],
      'Initiator': [
        {
          name: 'Sova',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Undisputed S-Tier staple; Recon Bolt reveals Mid and Site; Hunter Fury wallbangs through B-Main and Tree walls.',
          keyInteractions: ['Odin spam through B-Main with Recon', 'Hunters Fury on Catwalk/Tree'],
          synergies: ['Killjoy', 'Cypher']
        },
        {
          name: 'KAY/O',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'ZERO/POINT knife suppresses Killjoy/Cypher setups before executes; flash pop-flash guarantees Mid and site takes.',
          keyInteractions: ['Knife suppression on B-Site anchor', 'NULL/cmd ultimate site shutdown'],
          synergies: ['Jett', 'Omen']
        },
        {
          name: 'Fade',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Haunt lands on top of A-Site roofs; Prowlers clear Wine and Market effortlessly; Seize traps enemies in B-Main.',
          keyInteractions: ['Seize on B-Main choke with nades', 'Prowler clearing Wine'],
          synergies: ['Raze', 'Clove']
        },
        {
          name: 'Tejo',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Guided Salvo flushes out Wine and A-Tree; Stealth Drone bypasses defender crosshairs in Mid Courtyard.',
          keyInteractions: ['Guided Salvo double-detonation on Wine', 'Armageddon site clear on B-Site'],
          synergies: ['Omen', 'Killjoy']
        }
      ],
      'Sentinel': [
        {
          name: 'Cypher',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'High-ground Trapwires in B-Main and A-Main; Spycam spots Mid Pizza and Catwalk continuously.',
          keyInteractions: ['Unbreakable B-Main trips with cages', 'Spycam watching Mid Top'],
          synergies: ['Sova', 'Omen']
        },
        {
          name: 'Killjoy',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Lockdown forces complete evacuation of A or B site; Turret tags enemies across Mid Courtyard.',
          keyInteractions: ['Lockdown under A-Tree / B-Site retake', 'Nanoswarm lineups on default plant'],
          synergies: ['Sova', 'KAY/O']
        },
        {
          name: 'Veto',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Interceptor nullifies Sova darts, KAY/O knives, and mollies on site; Chokehold trap stops rushers in A-Main.',
          keyInteractions: ['Interceptor protecting B-Site defuse', 'Evolution ultimate site anchoring'],
          synergies: ['Omen', 'Sova']
        },
        {
          name: 'Vyse',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Shear isolates attackers entering B-Main; Arc Rose flashes defenders holding Tree and Market.',
          keyInteractions: ['Shear trap on B-Main choke', 'Steel Garden disarm on site execute'],
          synergies: ['Clove', 'Jett']
        }
      ]
    }
  },
  {
    mapName: 'Lotus',
    topographyType: 'Three Bomb Sites / Rotating Doors / Destructible Wall',
    metaArchetype: 'Aggressive Space-Contest & Self-Sustaining Flex',
    roleComposition: {
      'Duelist': [
        {
          name: 'Raze',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Boombot clears C-Mound and A-Rubble; Paint Shells devastate tight choke corridors at B and C.',
          keyInteractions: ['Blast Pack entry onto C-Site', 'Paint Shells into A-Tree / Rotating door'],
          synergies: ['Fade', 'Omen']
        },
        {
          name: 'Neon',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'High Gear allows lightning-fast rotations across three sites; Fast Lane walls off C-Mound and A-Main.',
          keyInteractions: ['Fast Lane covering C-Main push', 'Relay Bolt through rotating door'],
          synergies: ['Breach', 'Clove']
        },
        {
          name: 'Phoenix',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'High ranked winrate due to self-sufficiency; Curveball flashes around rotating doors; Run It Back guarantees safe info.',
          keyInteractions: ['Curveball through A/C rotating doors', 'Blaze wall on B-Site capture'],
          synergies: ['Clove', 'Vyse']
        },
        {
          name: 'Jett',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Tailwind provides safety in early Rubble and Mound duels; Cloudburst allows quick spike plants.',
          keyInteractions: ['Operator hold on C-Long sightline', 'Dash past A-Rubble choke'],
          synergies: ['Fade', 'Viper']
        }
      ],
      'Controller': [
        {
          name: 'Clove',
          tier: 'S',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Premier controller on Lotus; post-death smokes keep rotating doors and choke points blocked; self-revive swings close rounds.',
          keyInteractions: ['Post-death smoke on A-Link & C-Hall', 'Pick-Me-Up speed push through B-Site'],
          synergies: ['Raze', 'Fade']
        },
        {
          name: 'Omen',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Shrouded Step allows crossing Rubble and taking elevated C-Site boxes; Paranoia covers entire site paths.',
          keyInteractions: ['Paranoia through A-Main choke', 'Recharging smokes across all three sites'],
          synergies: ['Raze', 'Killjoy']
        },
        {
          name: 'Viper',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Essential in double-controller comps; Toxic Screen covers multiple sites simultaneously; Decay orb controls A-Main.',
          keyInteractions: ['Toxic Screen slicing A and B sites', 'Poison Cloud on C-Mound'],
          synergies: ['Clove', 'Fade']
        },
        {
          name: 'Miks',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Waveform smokes block rotating door sightlines; Harmonize combat stim supercharges team executing through tight chokes; Bassquake clears out enclosed C-Site.',
          keyInteractions: ['Harmonize with Raze/Neon on C-Site rush', 'Bassquake displacing defenders in B-Site'],
          synergies: ['Raze', 'Vyse']
        }
      ],
      'Initiator': [
        {
          name: 'Fade',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Haunt reveals players on all three sites; Prowlers clear A-Tree, B-Upper, and C-Bend; Seize traps rotating enemies.',
          keyInteractions: ['Haunt on A-Site roof', 'Seize combo with Paint Shells on C-Main'],
          synergies: ['Raze', 'Clove']
        },
        {
          name: 'Breach',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Fault Line concusses entire lengths of A-Rubble and C-Mound; Flashpoint through rotating doors sets up easy kills.',
          keyInteractions: ['Aftershock breaking destructible wall', 'Rolling Thunder covering A or C site completely'],
          synergies: ['Neon', 'Cypher']
        },
        {
          name: 'Gekko',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Wingman plants spike on any site while team holds crossfires; Dizzy re-usable flash clears open areas.',
          keyInteractions: ['Wingman plant on B-Site', 'Thrash ultimate site lockdown'],
          synergies: ['Omen', 'Vyse']
        },
        {
          name: 'Tejo',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Guided Salvo eliminates entrenched defenders behind C-Pillar and A-Drop; Stealth Drone scouts Rubble without vulnerability.',
          keyInteractions: ['Guided Salvo into C-Bend', 'Armageddon wiping out defenders on A-Site'],
          synergies: ['Viper', 'Killjoy']
        }
      ],
      'Sentinel': [
        {
          name: 'Vyse',
          tier: 'S',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Emerging S-Tier pick on Lotus; Shear isolates attackers committing to A-Tree or C-Mound; Arc Rose flashes through rotating doors.',
          keyInteractions: ['Shear isolation on A-Tree push', 'Steel Garden disarm on retake'],
          synergies: ['Clove', 'Raze']
        },
        {
          name: 'Killjoy',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Nanoswarms cover B-Site completely; Turret watches flanks while rotating; Lockdown secures retakes on A and C.',
          keyInteractions: ['Lockdown for A/C site retake', 'Alarmbot + Nanoswarm on C-Long choke'],
          synergies: ['Fade', 'Omen']
        },
        {
          name: 'Cypher',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Trapwires watch multiple flank routes; Spycam on A-Main spots early pushes.',
          keyInteractions: ['Trips on A-Lobby flank and C-Mound', 'Cyber Cage one-ways on A-Tree'],
          synergies: ['Omen', 'Sova']
        },
        {
          name: 'Deadlock',
          tier: 'B',
          pickRateTrend: 'Stable',
          strategicReasoning: 'GravNet forces attackers to crouch into nades; Sonic Sensor punishes fast rushes through rotating doors.',
          keyInteractions: ['Sonic Sensor at rotating door exits', 'Barrier Mesh blocking C-Site plant'],
          synergies: ['Raze', 'Viper']
        }
      ]
    }
  },
  {
    mapName: 'Sunset',
    topographyType: 'Narrow Chokepoints / Contested Courtyard Mid / Close-Quarters Sites',
    metaArchetype: 'Mid Courtyard Compression & Heavy Utility Flush',
    roleComposition: {
      'Duelist': [
        {
          name: 'Neon',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Premier entry duelist on Sunset; Fast Lane cuts straight through Mid Courtyard to split A or B; Slide dodges crossfires.',
          keyInteractions: ['Fast Lane through Mid Tiles', 'Relay Bolt into B-Boba and Market'],
          synergies: ['Breach', 'Omen']
        },
        {
          name: 'Raze',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Paint Shells and Boombot clear out tight Market and Boba chokepoints; Blast Packs contest Mid Tiles.',
          keyInteractions: ['Paint Shells into B-Main choke', 'Boombot clearing Market'],
          synergies: ['Fade', 'Cypher']
        },
        {
          name: 'Phoenix',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Curveball flashes blind around tight corners in A-Elbow and Market; Run It Back forces defense to yield Mid control.',
          keyInteractions: ['Run It Back push on Mid Courtyard', 'Hot Hands stalling spike defusal'],
          synergies: ['Clove', 'Sova']
        },
        {
          name: 'Waylay',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Refract decoy baits Operator fire in Mid Courtyard; Saturate impairs defenders rotating through narrow Market corridors.',
          keyInteractions: ['Refract hologram on Mid Tiles', 'Light Speed lateral dash across A-Alley'],
          synergies: ['Sova', 'Chamber']
        }
      ],
      'Controller': [
        {
          name: 'Omen',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Near 99% pick rate in pro play; Paranoia covers entire width of B-Main and A-Main; Shrouded Step allows tricky teleports in Market.',
          keyInteractions: ['Paranoia through B-Main / Market', 'One-way smoke on A-Elbow'],
          synergies: ['Neon', 'Cypher']
        },
        {
          name: 'Clove',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'High ranked winrate; post-death smokes on Mid Courtyard prevent defense from pushing after trades; self-revive secures close rounds.',
          keyInteractions: ['Post-mortem smokes on Mid Market and Top Mid', 'Pick-Me-Up aggressive swing in Mid'],
          synergies: ['Neon', 'Sova']
        },
        {
          name: 'Miks',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Waveform smokes block Mid sightlines instantly; Harmonize combat stim aids rapid entries into B-Site; M-Pulse heal sustains through heavy utility trades.',
          keyInteractions: ['Harmonize with Neon/Raze rushing Mid', 'Bassquake displacing defenders in Boba'],
          synergies: ['Raze', 'Vyse']
        },
        {
          name: 'Harbor',
          tier: 'B',
          pickRateTrend: 'Stable',
          strategicReasoning: 'High Tide wall cuts off wide Courtyard angles; Cove provides safe spike plant on exposed B-Site.',
          keyInteractions: ['High Tide carving through Mid to B', 'Cove protecting default plant'],
          synergies: ['Breach', 'Fade']
        }
      ],
      'Initiator': [
        {
          name: 'Sova',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Recon Bolt provides essential intel across Mid and B-Main; Owl Drone clears A-Elbow safely; Hunter Fury clears out post-plant and defusers.',
          keyInteractions: ['Recon Bolt over Mid Courtyard', 'Hunters Fury down B-Main corridor'],
          synergies: ['Cypher', 'Omen']
        },
        {
          name: 'Fade',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Haunt lands on market roofs to reveal entire Mid; Prowlers clear out tight A-Alley and B-Boba; Nightfall guarantees site retakes.',
          keyInteractions: ['Prowler clearing A-Elbow', 'Seize combo with Raze grenade in Market'],
          synergies: ['Raze', 'Clove']
        },
        {
          name: 'Breach',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Fault Line concusses entire length of B-Main and A-Alley; Flashpoint blinds through Market walls.',
          keyInteractions: ['Fault Line down B-Main at round start', 'Rolling Thunder covering all of A-Site'],
          synergies: ['Neon', 'Cypher']
        },
        {
          name: 'Gekko',
          tier: 'B',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Wingman clears corners and plants spike; Dizzy blinds players in Mid Courtyard.',
          keyInteractions: ['Wingman plant on B-Site', 'Mosh Pit zoning Market choke'],
          synergies: ['Omen', 'Chamber']
        }
      ],
      'Sentinel': [
        {
          name: 'Cypher',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Undisputed king of Sunset defense; Trapwires across B-Main and A-Elbow are devastatingly difficult to destroy without utility; Spycam monitors Mid.',
          keyInteractions: ['Unbreakable trips on B-Main', 'Cyber Cage one-ways holding A-Main'],
          synergies: ['Sova', 'Omen']
        },
        {
          name: 'Chamber',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Trademark watches Mid flank; Headhunter and Tour De Force dominate long Mid Courtyard sightlines.',
          keyInteractions: ['Operator pick in Mid Courtyard', 'Rendezvous teleport to safe Boba hold'],
          synergies: ['Omen', 'Sova']
        },
        {
          name: 'Vyse',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Shear wall splits attackers pushing B-Main; Arc Rose flashes through tight walls; Steel Garden shuts down site rushes.',
          keyInteractions: ['Shear trap isolating entries in B-Main', 'Steel Garden disarm on retake'],
          synergies: ['Neon', 'Miks']
        },
        {
          name: 'Deadlock',
          tier: 'B',
          pickRateTrend: 'Stable',
          strategicReasoning: 'GravNet stops Neon slides and rushes in chokepoints; Barrier Mesh completely blocks narrow B-Main.',
          keyInteractions: ['Barrier Mesh blocking B-Main entrance', 'Sonic Sensor at A-Alley corner'],
          synergies: ['Raze', 'Omen']
        }
      ]
    }
  },
  {
    mapName: 'Icebox',
    topographyType: 'Vertical Nest Sightlines / Tight Ziplines / Snowbound Crates',
    metaArchetype: 'Vertical Space Sniping & High-Ground Wall Denial',
    roleComposition: {
      'Duelist': [
        {
          name: 'Jett',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Updraft accesses top-tier sniper nests on A-Site and Mid; Tailwind safely evades crossfires on Yellow and B-Long.',
          keyInteractions: ['Operator hold on Mid Boiler', 'Updraft onto A-Pipes'],
          synergies: ['Sova', 'Viper']
        },
        {
          name: 'Reyna',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Dismiss allows safe peeking of long corridors; Leer easily blinds players holding high vertical boxes.',
          keyInteractions: ['Dismiss out of Yellow duel', 'Leer through B-Garbage'],
          synergies: ['Viper', 'Killjoy']
        },
        {
          name: 'Yoru',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Gatecrash teleports past dangerous B-Long crossfires; Blindside flashes pop seamlessly off metal containers.',
          keyInteractions: ['Dimensional Drift behind A-Site defenders', 'Fakeout clone triggering Tripwires/Alarmbots'],
          synergies: ['Sova', 'Gekko']
        },
        {
          name: 'Iso',
          tier: 'B',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Double Tap shield counters Operator dominance across Mid Boiler and B-Long.',
          keyInteractions: ['Shield peeking A-Belt', 'Undercut through Yellow box'],
          synergies: ['Sova', 'Harbor']
        }
      ],
      'Controller': [
        {
          name: 'Viper',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Toxic Screen is mandatory to block B-Snowman, Orange, and A-Screens; Poison Cloud secures plant.',
          keyInteractions: ['Toxic Screen slicing A and B sites', 'Snake Bite post-plant lineups'],
          synergies: ['Sova', 'Killjoy']
        },
        {
          name: 'Harbor',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'High Tide covers expansive angles on A-Site; Cove bulletproof shield guarantees default plant under Nest.',
          keyInteractions: ['Cove protecting A-Default plant', 'Cascade pushing down B-Long'],
          synergies: ['Viper', 'Jett']
        },
        {
          name: 'Clove',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Post-death smokes block Boiler and Tube; Pick-Me-Up provides speed and overheal for aggressive Mid lurks.',
          keyInteractions: ['Post-mortem smokes on Mid Tube & Boiler', 'Not Dead Yet self-revive in close clutch'],
          synergies: ['Jett', 'Sova']
        },
        {
          name: 'Omen',
          tier: 'B',
          pickRateTrend: 'Falling',
          strategicReasoning: 'Shrouded Step can teleport to Nest and Top Pipes, but spherical smokes leave gaps compared to wall controllers.',
          keyInteractions: ['Shrouded Step to top of A-Screen', 'Paranoia through Kitchen'],
          synergies: ['Sova', 'Sage']
        }
      ],
      'Initiator': [
        {
          name: 'Sova',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Open skybox enables cross-map Recon Bolts into B-Green and A-Site; Owl Drone is essential for clearing Maze and Yellow.',
          keyInteractions: ['Shock Dart lineup on default defuse', 'Hunters Fury down Mid Tube and B-Long'],
          synergies: ['Killjoy', 'Viper']
        },
        {
          name: 'Gekko',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Wingman effortlessly climbs A-Site containers to plant or defuse; Dizzy flash provides safe high-ground peeks.',
          keyInteractions: ['Wingman plant on top of A-Default', 'Thrash site clear through Kitchen'],
          synergies: ['Viper', 'Jett']
        },
        {
          name: 'KAY/O',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'ZERO/POINT knife disables Killjoy setups and Viper toxic walls; right-click flashes dominate Kitchen and Belt.',
          keyInteractions: ['Suppression knife into B-Site anchor', 'NULL/cmd ultimate push through Mid'],
          synergies: ['Jett', 'Sova']
        },
        {
          name: 'Fade',
          tier: 'B',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Prowlers clear out tight angles under A-Rafters and Kitchen; Nightfall covers entire A-Site.',
          keyInteractions: ['Seize on B-Long choke', 'Prowler clearing Maze'],
          synergies: ['Raze', 'Harbor']
        }
      ],
      'Sentinel': [
        {
          name: 'Killjoy',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Lockdown beneath A-Site forces entire attacker evacuation; Turret monitors Mid Tube and Kitchen without line-of-sight risk.',
          keyInteractions: ['Lockdown under A-Rafters', 'Nanoswarm lineups on B-Default plant'],
          synergies: ['Sova', 'Viper']
        },
        {
          name: 'Sage',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Barrier Wall enables safe spike plants on B-Default and blocks Mid Tube pushes; Slow Orbs delay rushers.',
          keyInteractions: ['Wall plant on B-Site', 'Wall blocking Mid Tube'],
          synergies: ['Jett', 'Sova']
        },
        {
          name: 'Deadlock',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'GravNet forces attackers down from high-ground containers; Barrier Mesh completely blocks B-Yellow or Kitchen.',
          keyInteractions: ['Barrier Mesh blocking Kitchen entrance', 'Sonic Sensor catching Zipline drops'],
          synergies: ['Sova', 'Gekko']
        },
        {
          name: 'Chamber',
          tier: 'B',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Trademark watches flank on Mid or B-Orange; Headhunter and Tour De Force provide high-value Operator picks on A-Belt.',
          keyInteractions: ['Operator hold on B-Long', 'Rendezvous teleport to safe nest'],
          synergies: ['Viper', 'Sova']
        }
      ]
    }
  },
  {
    mapName: 'Fracture',
    topographyType: 'H-Shaped Split Spawn / Dual Direction Pincher / Long Ropes',
    metaArchetype: 'Pincer Aggression & Rapid Flank Reversals',
    roleComposition: {
      'Duelist': [
        {
          name: 'Neon',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'High Gear rotates through underground ropes instantly; Fast Lane walls off dual-angle entrances on both A and B.',
          keyInteractions: ['Fast Lane down B-Main', 'Slide entry into A-Site drop'],
          synergies: ['Breach', 'Brimstone']
        },
        {
          name: 'Raze',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Paint Shells and Boombot clear out tight B-Tower and A-Drop corridors; Satchels clear Dish angles.',
          keyInteractions: ['Paint Shells into A-Drop choke', 'Boombot clearing B-Arcade'],
          synergies: ['Breach', 'Fade']
        },
        {
          name: 'Jett',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Tailwind provides escape after contesting early A-Dish or B-Arcade peeks; Operator holds long sightlines.',
          keyInteractions: ['Dash entry onto B-Site', 'Operator pick on A-Dish'],
          synergies: ['Breach', 'Cypher']
        },
        {
          name: 'Yoru',
          tier: 'B',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Gatecrash teleports between North and South spawns in seconds, creating unmatched pincer confusion.',
          keyInteractions: ['Gatecrash flank from A-Dish to B-Arcade', 'Dimensional Drift info gather'],
          synergies: ['Breach', 'Fade']
        }
      ],
      'Controller': [
        {
          name: 'Brimstone',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Triple simultaneous smokes execute A or B site completely; Stim Beacon accelerates fast pincer rushes; Incendiary denies defuse.',
          keyInteractions: ['Triple smoke execute onto A-Site', 'Orbital Strike clearing B-Tower / Cantina'],
          synergies: ['Breach', 'Neon']
        },
        {
          name: 'Harbor',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'High Tide wall flexibly bends around A-Drop and B-Site; Cove bulletproof shield enables secure plant.',
          keyInteractions: ['High Tide cutting across A-Site', 'Cove protecting B-Default plant'],
          synergies: ['Neon', 'Fade']
        },
        {
          name: 'Viper',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Toxic Screen slices across entire spawn connectors; Poison Cloud blocks A-Drop or B-Main indefinitely.',
          keyInteractions: ['Toxic Screen covering B-Arcade and Main', 'Viper Pit on A-Site lockdown'],
          synergies: ['Cypher', 'Breach']
        },
        {
          name: 'Omen',
          tier: 'B',
          pickRateTrend: 'Falling',
          strategicReasoning: 'Paranoia hits through B-Main and A-Drop walls, but slow smoke deploy speed is inferior to Brimstone fast executes.',
          keyInteractions: ['Paranoia through B-Main choke', 'Shrouded Step into A-Drop'],
          synergies: ['Raze', 'Killjoy']
        }
      ],
      'Initiator': [
        {
          name: 'Breach',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Undisputed god-tier agent on Fracture; Fault Line concusses entire lengths of A-Main and B-Main; Rolling Thunder guarantees site retake.',
          keyInteractions: ['Fault Line down A-Main at 0:00', 'Rolling Thunder covering entire B-Site'],
          synergies: ['Neon', 'Brimstone']
        },
        {
          name: 'Fade',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Haunt exposes attackers in A-Drop and B-Main; Prowlers clear tight corners in Arcade and Canteen; Seize combines with nades.',
          keyInteractions: ['Seize + Paint Shells combo at A-Drop', 'Prowler clearing B-Canteen'],
          synergies: ['Raze', 'Brimstone']
        },
        {
          name: 'Tejo',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Guided Salvo strikes A-Dish and B-Tower without risk; Stealth Drone scouts underground ropes safely.',
          keyInteractions: ['Guided Salvo on A-Drop', 'Armageddon site clear on B-Site'],
          synergies: ['Neon', 'Cypher']
        },
        {
          name: 'Gekko',
          tier: 'B',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Wingman sends plant through open crossfires while team holds both pincer angles; Dizzy reusable flash.',
          keyInteractions: ['Wingman plant on A-Site', 'Thrash ultimate through B-Arcade'],
          synergies: ['Breach', 'Brimstone']
        }
      ],
      'Sentinel': [
        {
          name: 'Cypher',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Global Trapwires guard against rapid underground rope flanks and pincer rotations; Spycam monitors opposite spawn.',
          keyInteractions: ['Trapwires on Underground Ropes and Arcade', 'Spycam watching A-Dish'],
          synergies: ['Breach', 'Brimstone']
        },
        {
          name: 'Killjoy',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Turret watches A-Dish while Killjoy anchors B-Site; Lockdown forces attackers off retake positions.',
          keyInteractions: ['Lockdown for B-Site retake', 'Alarmbot + Nanoswarms on B-Main choke'],
          synergies: ['Breach', 'Viper']
        },
        {
          name: 'Chamber',
          tier: 'B',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Trademark watches underground flank; Tour De Force Operator picks attackers crossing wide Dish sightlines.',
          keyInteractions: ['Operator hold on A-Dish', 'Rendezvous teleport to safe site box'],
          synergies: ['Brimstone', 'Fade']
        },
        {
          name: 'Deadlock',
          tier: 'B',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Sonic Sensors punish fast Neon and Raze rushes through A-Drop; Barrier Mesh seals off narrow A-Door.',
          keyInteractions: ['Barrier Mesh blocking A-Drop', 'Sonic Sensor at B-Main corner'],
          synergies: ['Breach', 'Raze']
        }
      ]
    }
  }
];
