import { type Agent, type Role, type ValorantMap } from '@/data/valorant';

export interface TacticalBrief {
  headline: string;
  tempo: 'Fast Execute' | 'Slow Default' | 'Split Push' | 'Heavy Retake' | 'Aggressive Map Control';
  winCondition: string;
  attackStrategy: string;
  defenseStrategy: string;
  keyCombo: string;
  ratingGrade: 'S+' | 'S' | 'A' | 'B' | 'Chaos';
}

export function generateTacticalBrief(
  assignments: Record<number, Agent | null>,
  selectedMap: ValorantMap | null
): TacticalBrief {
  const activeAgents = Object.values(assignments).filter((a): a is Agent => Boolean(a));
  
  if (activeAgents.length === 0) {
    return {
      headline: 'Awaiting Squad Deployment',
      tempo: 'Slow Default',
      winCondition: 'สุ่มตัวละครให้ครบทีมเพื่อวิเคราะห์จุดแข็งและกลยุทธ์',
      attackStrategy: 'รอดูรายชื่อเอเจนต์ในทีม',
      defenseStrategy: 'รอดูรายชื่อเอเจนต์ในทีม',
      keyCombo: 'N/A',
      ratingGrade: 'A',
    };
  }

  const roleCounts: Record<Role, number> = {
    'Duelist': 0,
    'Controller': 0,
    'Initiator': 0,
    'Sentinel': 0,
  };

  const agentNames = new Set(activeAgents.map(a => a.name));

  activeAgents.forEach(a => {
    roleCounts[a.role]++;
  });

  const duelists = roleCounts['Duelist'];
  const controllers = roleCounts['Controller'];
  const initiators = roleCounts['Initiator'];
  const sentinels = roleCounts['Sentinel'];

  // Check specific agent utilities
  const hasHeavyRecon = agentNames.has('Sova') || agentNames.has('Fade') || agentNames.has('Tejo');
  const hasStunOrFlash = agentNames.has('Breach') || agentNames.has('KAY/O') || agentNames.has('Skye');
  const hasLockdown = agentNames.has('Killjoy') || agentNames.has('Cypher') || agentNames.has('Vyse') || agentNames.has('Deadlock');
  const hasGlobalSmokes = agentNames.has('Astra') || agentNames.has('Omen') || agentNames.has('Miks');
  const hasDiveEntry = agentNames.has('Jett') || agentNames.has('Raze') || agentNames.has('Neon') || agentNames.has('Waylay');

  // Archetype & Headline evaluation
  let headline = 'Balanced Tactical Standard';
  let tempo: TacticalBrief['tempo'] = 'Slow Default';
  let winCondition = 'ประสานงานเทรดคิลตามตำแหน่งมาตรฐาน และคุมพื้นที่ Mid';
  let attackStrategy = 'ส่ง Initiator เปิดข้อมูลก่อน ค่อยให้ Duelist พุ่งเข้าไซต์ตามควัน';
  let defenseStrategy = 'เล่นยึดข้อมูลต้นรอบ ถอยเล่น Retake ร่วมกับสกิลหยุดยั้งของ Sentinel';
  let keyCombo = 'Default Team Synergy';
  let ratingGrade: TacticalBrief['ratingGrade'] = 'S';

  // 1. Five-stack special comps
  if (duelists >= 4) {
    headline = 'Rush B / Hyper-Aggressive Dive';
    tempo = 'Fast Execute';
    winCondition = 'บุกไวภายใน 20 วินาทีแรก ชนะด้วย Aim Duel และการรีบแลก Trade Kill';
    attackStrategy = 'บุกทะลวงไซต์เดียวพร้อมกันทุกคน ห้ามเดินช้า ใช้ Flash/Dash เปิดทาง';
    defenseStrategy = 'ดักยิง Push สวนต้นรอบตัดกำลังศัตรูทันที อย่ายืนรอในไซต์จนโดนล้อม';
    keyCombo = 'Duelist Flash & Dash Double-Entry';
    ratingGrade = 'Chaos';
  } else if (controllers >= 3) {
    headline = 'Total Smokescreen & Site Isolation';
    tempo = 'Split Push';
    winCondition = 'ปิดมุมสายตาศัตรูทั้งแมพ วางควันซ้อนแล้วแอบวาง Spike ในควัน';
    attackStrategy = 'สับขาหลอกด้วยการโปรยควัน 2 ไซต์พร้อมกัน แล้วเข้าไซต์ที่ศัตรูว่าง';
    defenseStrategy = 'ปล่อยควันวันเวย์ดักทุกทางเข้า ล็อค choke point ให้ศัตรูไม่กล้าเดินผ่าน';
    keyCombo = 'Cross-Map Smoke Wall & Isolation';
    ratingGrade = 'A';
  } else if (sentinels >= 3) {
    headline = 'Iron Fortress & Lockdown Retake';
    tempo = 'Heavy Retake';
    winCondition = 'คุมไซต์รับไม่ให้แตก หรือถอยออกมาใช้กับดักดักทางตอน Retake 100%';
    attackStrategy = 'เล่นช้า ล่อให้อีกฝ่ายดันออกมาติดกับดัก แล้วรุมยิงก่อนวาง Spike ท้ายรอบ';
    defenseStrategy = 'ตั้งป้อมกล้องและกับดักเต็มพื้นที่ ปล่อยให้ศัตรูเสียเวลาเคลียร์แล้วโดนหนีบยิง';
    keyCombo = 'Trapwire / Wall Lockdown Zone';
    ratingGrade = 'S';
  } else if (initiators >= 3) {
    headline = 'Wallhack Squad & Stun Dominance';
    tempo = 'Slow Default';
    winCondition = 'ยิง Recon สแกนตลอดรอบ ใช้ Flash และ Stun บีบศัตรูออกจากที่ซ่อน';
    attackStrategy = 'สแกนทุกมุมก่อนเดินเข้าไซต์ ศัตรูจะไม่สามารถตั้งรับในไซต์ได้เลย';
    defenseStrategy = 'สแปมสกิลใส่ทางเข้าตั้งแต่ 0.00 วินาทีแรก ตัดเลือดและขัดจังหวะการบุก';
    keyCombo = 'Recon Ping + Breach Faultline Stun';
    ratingGrade = 'S+';
  }
  // 2. High-level Pro Play Comps
  else if (controllers >= 2 && duelists === 1) {
    headline = 'VCT Pro Double-Controller Setup';
    tempo = 'Split Push';
    winCondition = 'คุมแผนที่ส่วนลึก (Deep Map Control) และลิดรอนวิชั่นของศัตรู';
    attackStrategy = 'แบ่งคนตัด Mid ด้วยควันผืนแรก แล้วใช้อีกควันปิดไซต์เพื่อ Execute';
    defenseStrategy = 'ใช้ควันหน่วงเวลาได้สองเท่า ทำให้ศัตรูเหลือเวลาไม่พอวาง Spike';
    keyCombo = 'Viper/Miks Screen + Secondary Smoke';
    ratingGrade = 'S+';
  } else if (initiators >= 2 && duelists === 1) {
    headline = 'Heavy Recon & Flank Denial';
    tempo = 'Slow Default';
    winCondition = 'เก็บข้อมูลทุกตำแหน่งบนแมพ แล้วเข้าไซต์ที่ปลอดภัยที่สุด';
    attackStrategy = 'เปิด Drone/Dog เช็คก่อนตามด้วย Flash เคลียร์มุมชิด';
    defenseStrategy = 'เล่น Retake 4 คน ประสานสกิลเปิดเผยตำแหน่งพร้อมบุกสวน';
    keyCombo = 'Sova Dart + Flash Entry';
    ratingGrade = 'S+';
  }

  // Utility synergy evaluation
  if (hasDiveEntry && hasStunOrFlash) {
    keyCombo = 'Stun/Flash Disruption into Dive Entry';
  } else if (hasLockdown && hasGlobalSmokes) {
    keyCombo = 'Smokescreen + Sentinel Site Lockdown';
  }

  // Map-specific strategic fine-tuning
  if (selectedMap === 'Ascent' && hasHeavyRecon) {
    winCondition += ' (ควบคุมพื้นที่ Mid Courtyard ให้ได้เปรียบ)';
  } else if (selectedMap === 'Bind' && agentNames.has('Brimstone') && agentNames.has('Raze')) {
    keyCombo = 'Brimstone Stim + Raze Satchel Entry';
    winCondition = 'เล่นคุม Teleporter ห้อง Hookah และ Showstopper ปิดไซต์ A';
  } else if (selectedMap === 'Summit') {
    winCondition += ' (ใช้กลไก Droppable Blast Walls ตัดการเข้าตีของศัตรู)';
    if (hasLockdown) {
      defenseStrategy += ' • วางกับดักหลัง Blast Walls เพื่อหน่วงเวลาสูงสุด';
    }
  } else if (selectedMap === 'Abyss' && agentNames.has('Omen')) {
    keyCombo = 'Omen Shrouded Stepข้ามเหว + Jett Updraft';
  } else if (hasGlobalSmokes && hasDiveEntry) {
    attackStrategy += ' • สโมคตัดสายตาระยะไกลแล้วส่งไดรฟ์เอ็นทรีเข้าพื้นที่ทันที';
  }

  return {
    headline,
    tempo,
    winCondition,
    attackStrategy,
    defenseStrategy,
    keyCombo,
    ratingGrade,
  };
}
