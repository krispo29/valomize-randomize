import { type Role, type ValorantMap } from './valorant';

export type TierRank = 'S' | 'A' | 'B';
export type PickRateTrend = 'Rising' | 'Stable' | 'Falling';

export interface AgentStrategyProfile {
  name: string;
  tier: TierRank;
  pickRateTrend: PickRateTrend;
  strategicReasoning: string;
  keyInteractions: string[];
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
          keyInteractions: ['Hover over death drops for info', 'Operator usage on long lines']
        },
        {
          name: 'Neon',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Rotation speed on large map is unmatched; Slide evades shots on long bridges.',
          keyInteractions: ['Relay Bolt on B-Site bridge', 'High Gear rotations']
        },
        {
          name: 'Waylay',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Multi-directional dash allows safe peeking of long angles; Refract baits OPs.',
          keyInteractions: ['Refract decoy on A-Main', 'Light Speed lateral dash']
        }
      ],
      'Initiator': [
        {
          name: 'Sova',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'High skybox allows cross-map recons; Owl Drone clears corners near death drops.',
          keyInteractions: ['Recon Bolt from spawn', 'Hunters Fury in narrow bridges']
        },
        {
          name: 'KAY/O',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Suppression causes environmental deaths for Jett/Raze over gaps.',
          keyInteractions: ['Knife hitting Jett mid-updraft', 'Flash-pop for long range peeks']
        },
        {
          name: 'Fade',
          tier: 'B',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Prowlers clear library/vent areas; Nightfall covers entire B-Site.',
          keyInteractions: ['Seize on bridge choke points']
        }
      ],
      'Controller': [
        {
          name: 'Omen',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Shrouded Step allows vertical movement similar to Jett; Paranoia covers A-Main lanes.',
          keyInteractions: ['Teleport to high ground', 'One-way smokes']
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
          keyInteractions: ['Spycam high placements', 'Tripwires on bridge']
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
          keyInteractions: ['GravNet forcing crouch-walk', 'Wall blocking bridge']
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
          keyInteractions: ['Showstopper in Showers', 'Nade stacking Lamps']
        },
        {
          name: 'Neon',
          tier: 'A',
          pickRateTrend: 'Rising',
          strategicReasoning: 'Fast rotates via TPs; High Gear floods sites.',
          keyInteractions: ['Slide into Hookah', 'Relay Bolt U-Hall']
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
          keyInteractions: ['Dog clearing Hookah', 'Flash out of smokes']
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
          keyInteractions: ['Molly lineups', 'Stim Beacon rush']
        },
        {
          name: 'Viper',
          tier: 'S',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Wall cuts B site; Snake bites combo with Raze nades.',
          keyInteractions: ['One-way on A-Short', 'Vipers Pit A-Lamps']
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
          keyInteractions: ['Camera B-Hookah', 'Cage one-ways']
        },
        {
          name: 'Sage',
          tier: 'A',
          pickRateTrend: 'Stable',
          strategicReasoning: 'Barrier Orb critical for B-Tube plant; Slows stop Hookah rush.',
          keyInteractions: ['Wall off Showers', 'Slow Orb Hookah']
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
  }
];
