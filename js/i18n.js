/* ============================================================
   MOA SPIN SIEGE — i18n (ko / en / zh / ja)
   Flat key dictionary. Every key must exist in all four
   languages; SB.I18n.check() reports any gaps.
   ============================================================ */
window.SB = window.SB || {};
(function () {
  const LANGS = ['ko', 'en', 'zh', 'ja'];
  const LABEL = { ko: 'KO', en: 'EN', zh: '中文', ja: '日本語' };

  const ko = {
    'app.subtitle': 'SIEGE',
    'app.tagline': '슬롯을 돌려 군단을 소환하라',
    'app.made': 'Web Audio · 오프라인 플레이 · v1.3',

    'ui.play': '게임 시작', 'ui.howto': '플레이 방법', 'ui.close': '닫기',
    'ui.menu': '메인 메뉴', 'ui.pause': '일시정지', 'ui.resume': '계속',
    'ui.lang': '언어', 'ui.mute': '소리 끄기', 'ui.unmute': '소리 켜기',
    'ui.best': '최고 기록', 'ui.bestWave': '최고 웨이브', 'ui.restart': '다시 도전',
    'ui.continue': '계속하기',

    'hud.hp': '성벽', 'hud.wave': '웨이브', 'hud.score': '점수',
    'hud.gold': '골드', 'hud.fever': '피버',

    'slot.spin': '스핀', 'slot.reroll': '리롤', 'slot.auto': '자동',
    'slot.held': '고정', 'slot.noCharge': '충전 중', 'slot.ready': '준비 완료',
    'slot.jackpot': '잭팟!', 'slot.match2': '2 매치', 'slot.triple': '3연속 동일 심볼!',
    'slot.pending': '소환 중', 'slot.laneFull': '라인 가득 참', 'slot.absorb': '흡수',
    'slot.hintSpin': '스핀을 눌러 유닛을 소환하세요',
    'slot.hintHold': '릴을 눌러 홀드할 수 있어요',
    'slot.hintMerge': '같은 유닛이 같은 라인에 오면 승급!',
    'slot.holdLimit': '릴은 최대 2개까지 고정됩니다', 'slot.autoOn': '자동 스핀 켜짐',
    'slot.combo2': '2X!', 'slot.combo3': '3 MATCH!', 'crit.label': 'CRIT!',

    'guide.title': '이렇게 하면 돼요',
    'guide.s1': '① 스핀을 눌러 병사 소환',
    'guide.s2': '② 같은 병사는 자동으로 합체·승급',
    'guide.s3': '③ 릴을 눌러 결과 고정(HOLD)',
    'guide.footer': '릴 1·2·3 = 위에서부터 라인 1·2·3',
    'lane.n1': '라인 1 (맨 위)', 'lane.n2': '라인 2 (가운데)', 'lane.n3': '라인 3 (맨 아래)',

    'rarity.common': '일반', 'rarity.rare': '희귀', 'rarity.epic': '영웅', 'rarity.legendary': '전설',
    'tier.1': '병사', 'tier.2': '정예', 'tier.3': '영웅', 'tier.4': '전설',

    'unit.spear': '창병', 'unit.archer': '궁수', 'unit.mage': '마법사',
    'unit.artillery': '포병', 'unit.knight': '기사', 'unit.coin': '골드', 'unit.relic': '유물',
    'unit.spear.d': '근접 찌르기 · 승급 시 관통', 'unit.archer.d': '원거리 연사',
    'unit.mage.d': '광역 마법 폭발', 'unit.artillery.d': '장거리 포격',
    'unit.knight.d': '높은 체력과 대검', 'unit.coin.d': '골드를 획득합니다',
    'unit.relic.d': '유물을 획득합니다',

    'wave.incoming': '웨이브 {n}', 'wave.clear': '웨이브 클리어',
    'wave.boss': '보스 등장', 'wave.bossDown': '보스 처치!', 'wave.next': '다음 웨이브까지 {n}',
    'wave.bossIncoming': '보스 접근 중', 'wave.bossDash': '보스 돌파!', 'wave.gold': '웨이브 보상 +{n}G',

    'draft.kicker': 'WAVE CLEAR', 'draft.title': '유물 선택',
    'draft.sub': '이번 런을 바꿀 유물 하나를 고르세요', 'draft.reroll': '리롤',
    'draft.noGold': '골드가 부족합니다', 'draft.pick': '선택', 'draft.empty': '모든 유물을 획득했습니다',

    'relic.jackpot': '잭팟 부적', 'relic.jackpot.d': '3연속 동일 심볼 확률 +30%',
    'relic.double': '쌍둥이 릴', 'relic.double.d': '스핀마다 25% 확률로 유닛 하나 추가 소환',
    'relic.pierce': '관통 창날', 'relic.pierce.d': '창병이 적 두 명을 동시에 찌릅니다',
    'relic.rapid': '속사 궁시', 'relic.rapid.d': '궁수 공격 속도 +35%',
    'relic.arcane': '비전 핵', 'relic.arcane.d': '마법사 폭발 피해 +45%',
    'relic.heavy': '중포 조준경', 'relic.heavy.d': '포병 공격력 +40%, 폭발 범위 확대',
    'relic.shield': '철벽 방패', 'relic.shield.d': '모든 유닛 최대 체력 +25%',
    'relic.gold': '황금 손', 'relic.gold.d': '골드 획득 +60%',
    'relic.wall': '성벽 보강', 'relic.wall.d': '성벽 최대 체력 +30, 즉시 회복',
    'relic.speed': '고속 릴', 'relic.speed.d': '스핀 충전 속도 +30%',
    'relic.fever': '피버 코어', 'relic.fever.d': '피버 게이지 충전 +50%',
    'relic.vamp': '흡혈 문장', 'relic.vamp.d': '유닛이 가한 피해의 10%를 회복',
    'relic.thunder': '뇌격 룬', 'relic.thunder.d': '6초마다 번개가 적 3명을 강타',
    'relic.command': '지휘관의 깃발', 'relic.command.d': '모든 유닛 공격력 +20%',
    'relic.crit': '치명의 눈', 'relic.crit.d': '치명타 확률 +15%, 치명타 피해 2.5배',
    'relic.bounty': '현상금 목록', 'relic.bounty.d': '적 처치 시 골드 +2',
    'relic.holy': '성검의 각성', 'relic.holy.d': '모든 유닛 공격력·체력 +35%, 황금 오라',

    'quest.title': '전술 미션',
    'quest.m1': '리롤로 2매치 이상 성공', 'quest.m2': '성벽 피격 없이 웨이브 클리어',
    'quest.m3': '릴 2개를 고정한 채 3매치', 'quest.m4': '리롤 1회 이하로 웨이브 클리어',
    'quest.m5': '이번 웨이브에 3단계 유닛 완성', 'quest.m6': '보스 등장 20초 안에 처치',
    'quest.m7': '낙뢰·메테오로 {n}기 처치', 'quest.m8': '릴 2개를 고정한 채 웨이브 클리어',
    'quest.reward.bolt': '⚡ 낙뢰 +1', 'quest.reward.meteor': '🔥 메테오 +1',
    'quest.reward.rerollFree': '무료 리롤 +{n}',
    'slot.free': '무료', 'ord.empty': '충전된 특수 아이템이 없습니다',
    'ord.boltTitle': '낙뢰 (Q) — 미션 보상으로 충전', 'ord.meteorTitle': '메테오 (E) — 미션 보상으로 충전',
    'quest.reward.heal': '성벽 +{n}', 'quest.reward.charge': '스핀 +{n}',
    'zone.1': '성문 초소', 'zone.2': '안개 숲', 'zone.3': '화염 협곡', 'zone.4': '암흑 요새', 'zone.5': '최종 성채',
    'zone.desc.1': '성문을 지켜라', 'zone.desc.2': '안개 속의 궁수들', 'zone.desc.3': '불길이 몰려온다',
    'zone.desc.4': '어둠의 군단', 'zone.desc.5': '최후의 성채', 'zone.map': '전장 진행',
    'slot.needGold': '골드가 부족합니다',
    'quest.reward.reroll': '리롤 +{n}', 'quest.done': '완료',

    'gameover.kicker': 'DEFEAT', 'gameover.title': '성벽이 무너졌다',
    'gameover.score': '최종 점수', 'gameover.wave': '도달 웨이브',
    'gameover.kills': '처치', 'gameover.promos': '승급', 'gameover.relics': '유물',
    'gameover.best': '최고 점수',

    'stat.score': '점수', 'stat.wave': '웨이브', 'stat.gold': '골드',
    'stat.kills': '처치', 'stat.promos': '승급', 'stat.relics': '유물',
    'stat.hp': '성벽', 'stat.units': '유닛',

    'howto.title': '플레이 방법',
    'howto.s1t': '스핀', 'howto.s1d': '스핀으로 릴을 돌려 유닛을 소환합니다. 릴 1·2·3은 위에서부터 라인 1·2·3을 채웁니다.',
    'howto.s2t': '매치', 'howto.s2d': '같은 심볼 2개는 보너스, 3개는 잭팟! 잭팟은 2단계 유닛 3기를 소환합니다.',
    'howto.s3t': '승급', 'howto.s3d': '같은 라인에 같은 유닛이 다시 나오면 합쳐져 승급합니다. 승급할수록 더 크고 강해집니다.',
    'howto.s4t': '홀드 / 리롤', 'howto.s4d': '릴을 눌러 홀드하고, 골드로 결과를 다시 돌립니다. 웨이브가 오를수록, 연속으로 돌릴수록 비싸집니다.',
    'howto.s5t': '유물', 'howto.s5d': '웨이브 클리어마다 유물 3개 중 하나를 골라 시너지를 만드세요.',

    'howto.s6t': '특수 슬롯', 'howto.s6d': '낙뢰·메테오 심볼이 나오면 전장을 한 번에 쓸어버립니다. 미션으로 충전한 ⚡🔥는 버튼(Q/E)으로 직접 사용합니다.',
    'howto.s7t': '전술 미션', 'howto.s7d': '홀드·리롤·무피해 클리어 같은 전술 목표를 달성하면 낙뢰 충전·무료 리롤·성벽 수리를 받습니다.',
    'vip.kicker': 'STARTER PACK', 'vip.title': 'VIP 스타터 팩',
    'vip.desc': '전설 유물 ‘성검의 각성’과 황금 스킨을 즉시 해금합니다. 무료 플레이에는 영향이 없습니다.',
    'vip.pack': 'VIP 팩 보기', 'vip.code': '체험 코드', 'vip.placeholder': '체험 코드 입력',
    'vip.enter': '등록', 'vip.success': '전설 유물이 해금되었습니다!',
    'vip.invalid': '유효하지 않은 코드입니다', 'vip.already': '이미 등록된 코드입니다',
    'vip.hint': '체험 코드: MOA-SLOT-2026', 'vip.relicName': '성검의 각성',
    'vip.relicDesc': '모든 유닛 공격력·체력 +35%, 황금 오라',
    'vip.unlocked': 'VIP 해금됨', 'vip.relicToast': '성검의 각성이 깨어났습니다',

    'toast.promo': '승급! {tier} {unit}', 'toast.relic': '유물 획득: {name}',
    'toast.quest': '미션 완료! {reward}', 'toast.fever': '피버 타임!',
    'toast.feverEnd': '피버 종료', 'toast.boss': '보스 접근 중',
    'toast.laneFull': '라인이 가득 찼습니다', 'toast.vip': 'VIP 스타터 팩이 해금되었습니다',
    'toast.newBest': '신기록!', 'toast.bossDown': '보스 처치 +{n}G',

    'item.frenzy': '잭팟 광폭화 릴',
    'unit.bolt': '낙뢰', 'unit.meteor': '메테오', 'unit.paladin': '성기사', 'unit.frenzy': '광폭화',
    'unit.bolt.d': '화면의 모든 적을 한 번에 강타합니다 (최대 체력 30% + 고정 피해, 1.1초 경직)',
    'unit.meteor.d': '가장 붐비는 라인에 메테오를 떨어뜨려 광역 피해와 강한 넉백을 줍니다',
    'unit.paladin.d': '3단계 황금 성기사를 소환합니다. 혼자서 라인을 밀어붙이는 프리미엄 유닛',
    'unit.frenzy.d': '9초 동안 매치 확률이 크게 오르고 스핀 충전이 1.6배 빨라집니다',
    'fx.bolt': '⚡ 낙뢰', 'fx.meteor': '🔥 메테오', 'fx.frenzy': '💎 잭팟 광폭화',
    'fx.frenzySub': '9초간 매치 확률 폭증',
    'toast.bolt': '낙뢰! 적 {n}기 강타', 'toast.meteor': '메테오 폭격!',
    'toast.paladin': '황금 성기사 소환!', 'toast.frenzy': '잭팟 광폭화 9초!',
    'trial.kicker': 'FREE TRIAL', 'trial.title': '전설 슬롯 체험',
    'trial.sub': '이번 게임 한정 — 황금 성기사 · 잭팟 광폭화',
    'trial.chip': '전설 슬롯 체험 중', 'trial.over': '전설 슬롯 체험 종료',
    'trial.cta': '🔒 VIP 팩으로 전설 슬롯을 편성하세요',
    'deck.kicker': 'SLOT CODEX', 'deck.title': '슬롯 도감 · 편성',
    'deck.sub': '기본 특수 슬롯은 누구나, 전설 슬롯은 VIP 팩으로 편성됩니다.',
    'deck.open': '슬롯 도감', 'deck.free': '기본 편성', 'deck.owned': '편성됨',
    'deck.trial': '체험 가능', 'deck.locked': '🔒 잠김', 'deck.unlock': 'VIP 팩 보기',
    'deck.trialNote': '전설 슬롯은 첫 게임 1–2웨이브에서 1회 무료로 체험할 수 있습니다.',
    'deck.vipNote': 'VIP 해금 완료 — 전설 슬롯이 덱에 편성되어 있습니다.',
    'deck.lockedNote': '전설 슬롯은 VIP 팩 코드로 편성됩니다. 체험은 게임당 1회입니다.',
    'revive.kicker': '조금만 더!', 'revive.free': '⚡ 낙뢰 보급 받고 웨이브 이어하기',
    'revive.note': '광고 데모 · 이번 런 1회 무료', 'revive.vip': '전설 슬롯으로 이어하기',
    'revive.vipLocked': '전설 슬롯 해금하고 재도전', 'revive.ok': '성벽 복구! 낙뢰가 쏟아진다',
    'revive.used': '무료 보급을 이미 사용했습니다',
    'footer.hint': 'SPACE: 스핀 · 1/2/3: 홀드 · M: 음소거 · 릴 1·2·3 = 라인 1·2·3'
  };

  const en = {
    'app.subtitle': 'SIEGE',
    'app.tagline': 'Spin the reels. Summon the legion.',
    'app.made': 'Web Audio · Offline play · v1.3',

    'ui.play': 'Play now', 'ui.howto': 'How to play', 'ui.close': 'Close',
    'ui.menu': 'Main menu', 'ui.pause': 'Paused', 'ui.resume': 'Resume',
    'ui.lang': 'Language', 'ui.mute': 'Mute', 'ui.unmute': 'Unmute',
    'ui.best': 'Best score', 'ui.bestWave': 'Best wave', 'ui.restart': 'Try again',
    'ui.continue': 'Continue',

    'hud.hp': 'Castle', 'hud.wave': 'Wave', 'hud.score': 'Score',
    'hud.gold': 'Gold', 'hud.fever': 'Fever',

    'slot.spin': 'Spin', 'slot.reroll': 'Reroll', 'slot.auto': 'Auto',
    'slot.held': 'Held', 'slot.noCharge': 'Charging', 'slot.ready': 'Ready',
    'slot.jackpot': 'Jackpot!', 'slot.match2': '2 match', 'slot.triple': '3 of a kind!',
    'slot.pending': 'Summoning', 'slot.laneFull': 'Lane full', 'slot.absorb': 'Absorb',
    'slot.hintSpin': 'Tap spin to summon your first unit',
    'slot.hintHold': 'Tap a reel to hold it',
    'slot.hintMerge': 'Two identical units on one lane promote!',
    'slot.holdLimit': 'You can hold up to 2 reels', 'slot.autoOn': 'Auto spin on',
    'slot.combo2': '2X!', 'slot.combo3': '3 MATCH!', 'crit.label': 'CRIT!',

    'guide.title': 'How it works',
    'guide.s1': '① Tap Spin to summon soldiers',
    'guide.s2': '② Duplicates merge and promote on their own',
    'guide.s3': '③ Tap a reel to hold that symbol',
    'guide.footer': 'Reels 1·2·3 = lanes 1·2·3 from the top',
    'lane.n1': 'Lane 1 (top)', 'lane.n2': 'Lane 2 (middle)', 'lane.n3': 'Lane 3 (bottom)',

    'rarity.common': 'Common', 'rarity.rare': 'Rare', 'rarity.epic': 'Epic', 'rarity.legendary': 'Legendary',
    'tier.1': 'Soldier', 'tier.2': 'Elite', 'tier.3': 'Hero', 'tier.4': 'Legend',

    'unit.spear': 'Spearman', 'unit.archer': 'Archer', 'unit.mage': 'Mage',
    'unit.artillery': 'Artillery', 'unit.knight': 'Knight', 'unit.coin': 'Gold', 'unit.relic': 'Relic',
    'unit.spear.d': 'Close thrust · pierces when promoted', 'unit.archer.d': 'Rapid ranged volley',
    'unit.mage.d': 'Splash magic burst', 'unit.artillery.d': 'Long-range bombardment',
    'unit.knight.d': 'High HP and greatsword', 'unit.coin.d': 'Grants gold',
    'unit.relic.d': 'Grants a relic',

    'wave.incoming': 'Wave {n}', 'wave.clear': 'Wave clear',
    'wave.boss': 'Boss incoming', 'wave.bossDown': 'Boss slain!', 'wave.next': 'Next wave in {n}',
    'wave.bossIncoming': 'Boss approaching', 'wave.bossDash': 'BOSS BREAKTHROUGH', 'wave.gold': 'Wave reward +{n}G',

    'draft.kicker': 'WAVE CLEAR', 'draft.title': 'Choose a relic',
    'draft.sub': 'Pick one relic to shape this run', 'draft.reroll': 'Reroll',
    'draft.noGold': 'Not enough gold', 'draft.pick': 'Pick', 'draft.empty': 'All relics collected',

    'relic.jackpot': 'Jackpot Charm', 'relic.jackpot.d': '+30% chance for three of a kind',
    'relic.double': 'Twin Reels', 'relic.double.d': '25% chance per spin to summon an extra unit',
    'relic.pierce': 'Piercing Point', 'relic.pierce.d': 'Spearmen strike two enemies at once',
    'relic.rapid': 'Rapid Bowstring', 'relic.rapid.d': 'Archer attack speed +25%',
    'relic.arcane': 'Arcane Core', 'relic.arcane.d': 'Mage blast damage +45%',
    'relic.heavy': 'Heavy Scope', 'relic.heavy.d': 'Artillery damage +40%, bigger blast',
    'relic.shield': 'Ironwall Aegis', 'relic.shield.d': 'All units max HP +25%',
    'relic.gold': 'Golden Touch', 'relic.gold.d': 'Gold gain +60%',
    'relic.wall': 'Fortified Wall', 'relic.wall.d': 'Castle max HP +30 and heals now',
    'relic.speed': 'Overclocked Reel', 'relic.speed.d': 'Spin recharge +30%',
    'relic.fever': 'Fever Core', 'relic.fever.d': 'Fever gauge gain +50%',
    'relic.vamp': 'Bloodsigil', 'relic.vamp.d': 'Units heal 10% of damage dealt',
    'relic.thunder': 'Thunder Rune', 'relic.thunder.d': 'Every 6s lightning strikes 3 enemies',
    'relic.command': "Commander's Banner", 'relic.command.d': 'All units attack +20%',
    'relic.crit': 'Eye of Precision', 'relic.crit.d': 'Crit chance +15%, crit damage x2.5',
    'relic.bounty': 'Bounty Ledger', 'relic.bounty.d': '+2 gold per enemy killed',
    'relic.holy': 'Awakening of the Holy Blade', 'relic.holy.d': 'All units +35% ATK & HP, golden aura',

    'quest.title': 'Tactical missions',
    'quest.m1': 'Land a 2+ match after a reroll', 'quest.m2': 'Clear a wave with no wall damage',
    'quest.m3': 'Land a 3-match while holding two reels', 'quest.m4': 'Clear a wave with at most one reroll',
    'quest.m5': 'Build a tier-3 unit this wave', 'quest.m6': 'Kill a boss within 20 s of arrival',
    'quest.m7': 'Kill {n} enemies with lightning or meteor', 'quest.m8': 'Clear a wave holding two reels',
    'quest.reward.bolt': '⚡ Lightning +1', 'quest.reward.meteor': '🔥 Meteor +1',
    'quest.reward.rerollFree': 'Free reroll +{n}',
    'slot.free': 'FREE', 'ord.empty': 'No special items charged',
    'ord.boltTitle': 'Lightning (Q) — charged by missions', 'ord.meteorTitle': 'Meteor (E) — charged by missions',
    'quest.reward.heal': 'Wall +{n}', 'quest.reward.charge': 'Spin +{n}',
    'zone.1': 'Gate Outpost', 'zone.2': 'Mistwood', 'zone.3': 'Ember Gorge', 'zone.4': 'Dark Keep', 'zone.5': 'Final Citadel',
    'zone.desc.1': 'Hold the gate', 'zone.desc.2': 'Archers in the mist', 'zone.desc.3': 'The gorge burns',
    'zone.desc.4': 'Legion of the dark', 'zone.desc.5': 'The last citadel', 'zone.map': 'Campaign',
    'slot.needGold': 'Not enough gold',
    'quest.reward.reroll': 'Reroll +{n}', 'quest.done': 'Done',

    'gameover.kicker': 'DEFEAT', 'gameover.title': 'The wall has fallen',
    'gameover.score': 'Final score', 'gameover.wave': 'Wave reached',
    'gameover.kills': 'Kills', 'gameover.promos': 'Promotions', 'gameover.relics': 'Relics',
    'gameover.best': 'Best score',

    'stat.score': 'Score', 'stat.wave': 'Wave', 'stat.gold': 'Gold',
    'stat.kills': 'Kills', 'stat.promos': 'Promotions', 'stat.relics': 'Relics',
    'stat.hp': 'Castle', 'stat.units': 'Units',

    'howto.title': 'How to play',
    'howto.s1t': 'Spin', 'howto.s1d': 'Spin the reels to summon units. Reels 1·2·3 feed lanes 1·2·3 from the top.',
    'howto.s2t': 'Match', 'howto.s2d': 'Two matching symbols give a bonus; three trigger a jackpot — three tier-2 units.',
    'howto.s3t': 'Promote', 'howto.s3d': 'A duplicate unit on the same lane merges into a stronger, bigger hero.',
    'howto.s4t': 'Hold / reroll', 'howto.s4d': 'Tap a reel to hold it, then spend gold to spin again. Rerolls cost more in later waves and on repeats.',
    'howto.s5t': 'Relics', 'howto.s5d': 'Clear a wave, then pick one of three relics to build a synergy.',

    'howto.s6t': 'Special slots', 'howto.s6d': 'Lightning and meteor symbols wipe the field in one strike. Mission-earned ⚡🔥 fire from their own buttons (Q/E).',
    'howto.s7t': 'Tactical missions', 'howto.s7d': 'Reach tactical goals — holds, rerolls, damage-free waves — to earn lightning charges, free rerolls and wall repairs.',
    'vip.kicker': 'STARTER PACK', 'vip.title': 'VIP Starter Pack',
    'vip.desc': 'Unlocks the legendary relic “Awakening of the Holy Blade” and a golden skin instantly. Free play is unaffected.',
    'vip.pack': 'View VIP pack', 'vip.code': 'Trial code', 'vip.placeholder': 'Enter code',
    'vip.enter': 'Redeem', 'vip.success': 'Legendary relic unlocked!',
    'vip.invalid': 'That code is not valid', 'vip.already': 'This code is already redeemed',
    'vip.hint': 'Trial code: MOA-SLOT-2026', 'vip.relicName': 'Awakening of the Holy Blade',
    'vip.relicDesc': 'All units +35% ATK & HP, golden aura',
    'vip.unlocked': 'VIP unlocked', 'vip.relicToast': 'The Holy Blade awakens',

    'toast.promo': 'Promoted! {tier} {unit}', 'toast.relic': 'Relic acquired: {name}',
    'toast.quest': 'Mission complete! {reward}', 'toast.fever': 'Fever time!',
    'toast.feverEnd': 'Fever over', 'toast.boss': 'Boss approaching',
    'toast.laneFull': 'Lane is full', 'toast.vip': 'VIP Starter Pack unlocked',
    'toast.newBest': 'New record!', 'toast.bossDown': 'Boss slain +{n}G',

    'item.frenzy': 'Jackpot Frenzy Reel',
    'unit.bolt': 'Lightning', 'unit.meteor': 'Meteor', 'unit.paladin': 'Paladin', 'unit.frenzy': 'Frenzy',
    'unit.bolt.d': 'Strikes every enemy on screen at once (30% max HP + flat damage, 1.1 s stun)',
    'unit.meteor.d': 'Drops a meteor on the busiest lane: wide damage plus a heavy knockback',
    'unit.paladin.d': 'Summons a tier-3 Golden Paladin — a premium unit that pushes a lane alone',
    'unit.frenzy.d': 'For 9 s match odds jump and spin charge runs 1.6x faster',
    'fx.bolt': '⚡ LIGHTNING', 'fx.meteor': '🔥 METEOR', 'fx.frenzy': '💎 JACKPOT FRENZY',
    'fx.frenzySub': 'massive match odds for 9 s',
    'toast.bolt': 'Lightning! {n} enemies struck', 'toast.meteor': 'Meteor barrage!',
    'toast.paladin': 'Golden Paladin summoned!', 'toast.frenzy': 'Jackpot frenzy — 9 s!',
    'trial.kicker': 'FREE TRIAL', 'trial.title': 'Legendary slot trial',
    'trial.sub': 'this game only — Golden Paladin · Jackpot Frenzy',
    'trial.chip': 'Legendary trial active', 'trial.over': 'Legendary trial ended',
    'trial.cta': '🔒 Add legendary slots with the VIP pack',
    'deck.kicker': 'SLOT CODEX', 'deck.title': 'Slot codex · loadout',
    'deck.sub': 'Basic special slots are free for everyone. Legendary slots come with the VIP pack.',
    'deck.open': 'Slot codex', 'deck.free': 'Standard', 'deck.owned': 'Equipped',
    'deck.trial': 'Trial ready', 'deck.locked': '🔒 Locked', 'deck.unlock': 'See VIP pack',
    'deck.trialNote': 'Legendary slots can be tried once, free, during waves 1-2 of your first game.',
    'deck.vipNote': 'VIP unlocked — legendary slots are equipped in your deck.',
    'deck.lockedNote': 'Legendary slots are added with a VIP pack code. One trial per game.',
    'revive.kicker': 'SO CLOSE!', 'revive.free': '⚡ Take a lightning drop and continue',
    'revive.note': 'demo · free once this run', 'revive.vip': 'Continue with legendary slots',
    'revive.vipLocked': 'Unlock legendary slots and retry', 'revive.ok': 'Wall restored! Lightning falls',
    'revive.used': 'The free drop is already used',
    'footer.hint': 'SPACE: spin · 1/2/3: hold · M: mute · reels 1·2·3 = lanes 1·2·3'
  };

  const zh = {
    'app.subtitle': 'SIEGE',
    'app.tagline': '转动老虎机，召唤你的军团',
    'app.made': 'Web Audio · 离线可玩 · v1.3',

    'ui.play': '开始游戏', 'ui.howto': '玩法说明', 'ui.close': '关闭',
    'ui.menu': '主菜单', 'ui.pause': '暂停', 'ui.resume': '继续',
    'ui.lang': '语言', 'ui.mute': '关闭声音', 'ui.unmute': '打开声音',
    'ui.best': '最高纪录', 'ui.bestWave': '最高波次', 'ui.restart': '再来一次',
    'ui.continue': '继续游戏',

    'hud.hp': '城墙', 'hud.wave': '波次', 'hud.score': '得分',
    'hud.gold': '金币', 'hud.fever': '狂热',

    'slot.spin': '旋转', 'slot.reroll': '重掷', 'slot.auto': '自动',
    'slot.held': '锁定', 'slot.noCharge': '充能中', 'slot.ready': '就绪',
    'slot.jackpot': '头奖！', 'slot.match2': '二连匹配', 'slot.triple': '三连相同符号！',
    'slot.pending': '召唤中', 'slot.laneFull': '该路已满', 'slot.absorb': '吸收',
    'slot.hintSpin': '点击旋转召唤第一个单位',
    'slot.hintHold': '点击转轮可锁定该符号',
    'slot.hintMerge': '同一路上出现相同单位即可晋升！',
    'slot.holdLimit': '最多锁定 2 个转轮', 'slot.autoOn': '自动旋转已开启',
    'slot.combo2': '2X!', 'slot.combo3': '3 MATCH!', 'crit.label': 'CRIT!',

    'guide.title': '这样玩',
    'guide.s1': '① 点击旋转召唤士兵',
    'guide.s2': '② 相同士兵会自动合并·晋升',
    'guide.s3': '③ 点击转轮锁定该符号（HOLD）',
    'guide.footer': '转轮 1·2·3 = 从上到下第 1·2·3 路',
    'lane.n1': '第 1 路（上）', 'lane.n2': '第 2 路（中）', 'lane.n3': '第 3 路（下）',

    'rarity.common': '普通', 'rarity.rare': '稀有', 'rarity.epic': '史诗', 'rarity.legendary': '传说',
    'tier.1': '士兵', 'tier.2': '精英', 'tier.3': '英雄', 'tier.4': '传说',

    'unit.spear': '枪兵', 'unit.archer': '弓手', 'unit.mage': '法师',
    'unit.artillery': '炮兵', 'unit.knight': '骑士', 'unit.coin': '金币', 'unit.relic': '遗物',
    'unit.spear.d': '近身突刺 · 晋升后贯穿', 'unit.archer.d': '远程连射',
    'unit.mage.d': '范围魔法爆炸', 'unit.artillery.d': '远程炮击',
    'unit.knight.d': '高生命与大剑', 'unit.coin.d': '获得金币',
    'unit.relic.d': '获得一件遗物',

    'wave.incoming': '第 {n} 波', 'wave.clear': '波次清除',
    'wave.boss': '首领来袭', 'wave.bossDown': '首领击破！', 'wave.next': '下一波：{n}',
    'wave.bossIncoming': '首领接近中', 'wave.bossDash': '首领突破！', 'wave.gold': '波次奖励 +{n}G',

    'draft.kicker': 'WAVE CLEAR', 'draft.title': '选择遗物',
    'draft.sub': '选择一件遗物，改变这一局', 'draft.reroll': '重掷',
    'draft.noGold': '金币不足', 'draft.pick': '选择', 'draft.empty': '已收集全部遗物',

    'relic.jackpot': '头奖护符', 'relic.jackpot.d': '三连相同符号概率 +30%',
    'relic.double': '双子转轮', 'relic.double.d': '每次旋转有 25% 概率额外召唤一个单位',
    'relic.pierce': '穿透枪尖', 'relic.pierce.d': '枪兵可同时刺中两名敌人',
    'relic.rapid': '速射弓弦', 'relic.rapid.d': '弓手攻速 +25%',
    'relic.arcane': '奥术核心', 'relic.arcane.d': '法师爆炸伤害 +45%',
    'relic.heavy': '重炮瞄具', 'relic.heavy.d': '炮兵伤害 +40%，爆炸范围扩大',
    'relic.shield': '铁壁之盾', 'relic.shield.d': '所有单位最大生命 +25%',
    'relic.gold': '黄金之手', 'relic.gold.d': '金币获取 +60%',
    'relic.wall': '城墙加固', 'relic.wall.d': '城墙最大生命 +30，并立即回复',
    'relic.speed': '高速转轮', 'relic.speed.d': '旋转充能速度 +30%',
    'relic.fever': '狂热核心', 'relic.fever.d': '狂热槽充能 +50%',
    'relic.vamp': '吸血纹章', 'relic.vamp.d': '单位回复所造成伤害的 10%',
    'relic.thunder': '雷霆符文', 'relic.thunder.d': '每 6 秒雷击 3 名敌人',
    'relic.command': '指挥官之旗', 'relic.command.d': '所有单位攻击力 +20%',
    'relic.crit': '致命之眼', 'relic.crit.d': '暴击率 +15%，暴击伤害 2.5 倍',
    'relic.bounty': '悬赏名录', 'relic.bounty.d': '每次击杀 +2 金币',
    'relic.holy': '圣剑觉醒', 'relic.holy.d': '所有单位攻击力·生命 +35%，金色光环',

    'quest.title': '战术任务',
    'quest.m1': '重掷后达成 2 连匹配', 'quest.m2': '不受城墙伤害通关一波',
    'quest.m3': '锁定两个转轮时达成 3 连匹配', 'quest.m4': '重掷不超过 1 次通关一波',
    'quest.m5': '本波内合成 3 级单位', 'quest.m6': '首领出现 20 秒内击败',
    'quest.m7': '用落雷或陨石击败 {n} 名敌人', 'quest.m8': '锁定两个转轮通关一波',
    'quest.reward.bolt': '⚡ 落雷 +1', 'quest.reward.meteor': '🔥 陨石 +1',
    'quest.reward.rerollFree': '免费重掷 +{n}',
    'slot.free': '免费', 'ord.empty': '没有充能的特殊道具',
    'ord.boltTitle': '落雷（Q）— 通过任务充能', 'ord.meteorTitle': '陨石（E）— 通过任务充能',
    'quest.reward.heal': '城墙 +{n}', 'quest.reward.charge': '旋转 +{n}',
    'zone.1': '城门哨所', 'zone.2': '迷雾森林', 'zone.3': '烈焰峡谷', 'zone.4': '暗黑要塞', 'zone.5': '最终城堡',
    'zone.desc.1': '守住城门', 'zone.desc.2': '雾中的弓手', 'zone.desc.3': '烈焰袭来',
    'zone.desc.4': '黑暗军团', 'zone.desc.5': '最后的城堡', 'zone.map': '战场进度',
    'slot.needGold': '金币不足',
    'quest.reward.reroll': '重掷 +{n}', 'quest.done': '完成',

    'gameover.kicker': 'DEFEAT', 'gameover.title': '城墙崩塌了',
    'gameover.score': '最终得分', 'gameover.wave': '到达波次',
    'gameover.kills': '击杀', 'gameover.promos': '晋升', 'gameover.relics': '遗物',
    'gameover.best': '最高得分',

    'stat.score': '得分', 'stat.wave': '波次', 'stat.gold': '金币',
    'stat.kills': '击杀', 'stat.promos': '晋升', 'stat.relics': '遗物',
    'stat.hp': '城墙', 'stat.units': '单位',

    'howto.title': '玩法说明',
    'howto.s1t': '旋转', 'howto.s1d': '旋转转轮召唤单位，转轮 1·2·3 对应从上到下第 1·2·3 路。',
    'howto.s2t': '匹配', 'howto.s2d': '两个相同符号获得加成，三个触发头奖——召唤 3 个二阶单位。',
    'howto.s3t': '晋升', 'howto.s3d': '同一路上出现相同单位会合并，变得更大更强。',
    'howto.s4t': '锁定 / 重掷', 'howto.s4d': '点击转轮锁定符号，用金币重新旋转。波次越高、连续重掷越多，费用越高。',
    'howto.s5t': '遗物', 'howto.s5d': '每清完一波，从三件遗物中选择一件来组合效果。',

    'howto.s6t': '特殊转轮', 'howto.s6d': '出现落雷或陨石符号时瞬间清扫战场。任务充能的 ⚡🔥 可用按钮（Q/E）手动释放。',
    'howto.s7t': '战术任务', 'howto.s7d': '完成锁定、重掷、无伤通关等战术目标，可获得落雷充能、免费重掷与城墙修复。',
    'vip.kicker': 'STARTER PACK', 'vip.title': 'VIP 新手礼包',
    'vip.desc': '立即解锁传说遗物“圣剑觉醒”与金色皮肤。不影响免费游玩。',
    'vip.pack': '查看 VIP 礼包', 'vip.code': '体验码', 'vip.placeholder': '输入体验码',
    'vip.enter': '兑换', 'vip.success': '传说遗物已解锁！',
    'vip.invalid': '体验码无效', 'vip.already': '该体验码已兑换',
    'vip.hint': '体验码：MOA-SLOT-2026', 'vip.relicName': '圣剑觉醒',
    'vip.relicDesc': '所有单位攻击力·生命 +35%，金色光环',
    'vip.unlocked': 'VIP 已解锁', 'vip.relicToast': '圣剑苏醒了',

    'toast.promo': '晋升！{tier}{unit}', 'toast.relic': '获得遗物：{name}',
    'toast.quest': '任务完成！{reward}', 'toast.fever': '狂热时间！',
    'toast.feverEnd': '狂热结束', 'toast.boss': '首领接近中',
    'toast.laneFull': '该路已满', 'toast.vip': 'VIP 新手礼包已解锁',
    'toast.newBest': '新纪录！', 'toast.bossDown': '首领击破 +{n}G',

    'item.frenzy': '头奖狂暴转轮',
    'unit.bolt': '落雷', 'unit.meteor': '陨石', 'unit.paladin': '圣骑士', 'unit.frenzy': '狂暴',
    'unit.bolt.d': '一次打击画面中所有敌人（最大生命 30% + 固定伤害，1.1 秒眩晕）',
    'unit.meteor.d': '向敌人最多的路线投下陨石，造成范围伤害与强力击退',
    'unit.paladin.d': '召唤 3 级黄金圣骑士——可以独自推线的尊享单位',
    'unit.frenzy.d': '9 秒内匹配概率大幅提升，旋转充能快 1.6 倍',
    'fx.bolt': '⚡ 落雷', 'fx.meteor': '🔥 陨石', 'fx.frenzy': '💎 头奖狂暴',
    'fx.frenzySub': '9 秒内匹配概率暴增',
    'toast.bolt': '落雷！{n} 名敌人大受打击', 'toast.meteor': '陨石轰炸！',
    'toast.paladin': '黄金圣骑士登场！', 'toast.frenzy': '头奖狂暴 9 秒！',
    'trial.kicker': 'FREE TRIAL', 'trial.title': '传说转轮体验',
    'trial.sub': '仅限本局——黄金圣骑士 · 头奖狂暴',
    'trial.chip': '传说转轮体验中', 'trial.over': '传说转轮体验结束',
    'trial.cta': '🔒 用 VIP 礼包编入传说转轮',
    'deck.kicker': 'SLOT CODEX', 'deck.title': '转轮图鉴 · 编成',
    'deck.sub': '基础特殊转轮人人可用，传说转轮通过 VIP 礼包编成。',
    'deck.open': '转轮图鉴', 'deck.free': '基础编成', 'deck.owned': '已编成',
    'deck.trial': '可体验', 'deck.locked': '🔒 已锁定', 'deck.unlock': '查看 VIP 礼包',
    'deck.trialNote': '首局游戏第 1-2 波可免费体验一次传说转轮。',
    'deck.vipNote': 'VIP 已解锁——传说转轮已编入卡组。',
    'deck.lockedNote': '传说转轮通过 VIP 礼包代码编成。每局可体验一次。',
    'revive.kicker': '就差一点！', 'revive.free': '⚡ 领取落雷补给，继续这一波',
    'revive.note': '演示 · 本局免费一次', 'revive.vip': '用传说转轮继续',
    'revive.vipLocked': '解锁传说转轮再挑战', 'revive.ok': '城墙修复！落雷倾泻',
    'revive.used': '本局免费补给已使用',
    'footer.hint': '空格：旋转 · 1/2/3：锁定 · M：静音 · 转轮 1·2·3 = 第 1·2·3 路'
  };

  const ja = {
    'app.subtitle': 'SIEGE',
    'app.tagline': 'スロットを回して軍団を召喚せよ',
    'app.made': 'Web Audio · オフライン対応 · v1.3',

    'ui.play': 'ゲーム開始', 'ui.howto': '遊び方', 'ui.close': '閉じる',
    'ui.menu': 'メインメニュー', 'ui.pause': '一時停止', 'ui.resume': '再開',
    'ui.lang': '言語', 'ui.mute': 'サウンドOFF', 'ui.unmute': 'サウンドON',
    'ui.best': '最高記録', 'ui.bestWave': '最高ウェーブ', 'ui.restart': 'もう一度',
    'ui.continue': '続ける',

    'hud.hp': '城壁', 'hud.wave': 'ウェーブ', 'hud.score': 'スコア',
    'hud.gold': 'ゴールド', 'hud.fever': 'フィーバー',

    'slot.spin': 'スピン', 'slot.reroll': 'リロール', 'slot.auto': 'オート',
    'slot.held': '固定', 'slot.noCharge': 'チャージ中', 'slot.ready': '準備完了',
    'slot.jackpot': 'ジャックポット！', 'slot.match2': '2マッチ', 'slot.triple': '3連同種シンボル！',
    'slot.pending': '召喚中', 'slot.laneFull': 'レーン満杯', 'slot.absorb': '吸収',
    'slot.hintSpin': 'スピンで最初のユニットを召喚',
    'slot.hintHold': 'リールをタップで固定できます',
    'slot.hintMerge': '同じレーンに同じユニットで昇級！',
    'slot.holdLimit': '固定できるのは最大2リール', 'slot.autoOn': 'オートスピンON',
    'slot.combo2': '2X!', 'slot.combo3': '3 MATCH!', 'crit.label': 'CRIT!',

    'guide.title': 'はじめに',
    'guide.s1': '① スピンで兵士を召喚',
    'guide.s2': '② 同じ兵士は自動で合体・昇級',
    'guide.s3': '③ リールをタップで固定（HOLD）',
    'guide.footer': 'リール1·2·3 = 上からレーン1·2·3',
    'lane.n1': 'レーン1（上）', 'lane.n2': 'レーン2（中）', 'lane.n3': 'レーン3（下）',

    'rarity.common': 'ノーマル', 'rarity.rare': 'レア', 'rarity.epic': 'エピック', 'rarity.legendary': '伝説',
    'tier.1': '兵士', 'tier.2': '精鋭', 'tier.3': '英雄', 'tier.4': '伝説',

    'unit.spear': '槍兵', 'unit.archer': '弓兵', 'unit.mage': '魔術師',
    'unit.artillery': '砲兵', 'unit.knight': '騎士', 'unit.coin': 'ゴールド', 'unit.relic': '遺物',
    'unit.spear.d': '近接突き · 昇級で貫通', 'unit.archer.d': '遠距離連射',
    'unit.mage.d': '範囲魔法爆発', 'unit.artillery.d': '長距離砲撃',
    'unit.knight.d': '高HPと大剣', 'unit.coin.d': 'ゴールドを獲得',
    'unit.relic.d': '遺物を獲得',

    'wave.incoming': 'ウェーブ {n}', 'wave.clear': 'ウェーブクリア',
    'wave.boss': 'ボス出現', 'wave.bossDown': 'ボス撃破！', 'wave.next': '次のウェーブまで {n}',
    'wave.bossIncoming': 'ボス接近中', 'wave.bossDash': 'ボス突破！', 'wave.gold': 'ウェーブ報酬 +{n}G',

    'draft.kicker': 'WAVE CLEAR', 'draft.title': '遺物を選択',
    'draft.sub': 'このランを変える遺物を1つ選べ', 'draft.reroll': 'リロール',
    'draft.noGold': 'ゴールド不足', 'draft.pick': '選択', 'draft.empty': '全遺物を獲得済み',

    'relic.jackpot': 'ジャックポットの護符', 'relic.jackpot.d': '3連同種の確率 +30%',
    'relic.double': 'ツインリール', 'relic.double.d': 'スピン毎に25%でユニットを追加召喚',
    'relic.pierce': '貫通の穂先', 'relic.pierce.d': '槍兵が敵2体を同時に突く',
    'relic.rapid': '速射の弓弦', 'relic.rapid.d': '弓兵の攻撃速度 +25%',
    'relic.arcane': 'アルケインコア', 'relic.arcane.d': '魔術師の爆発ダメージ +45%',
    'relic.heavy': '重砲照準器', 'relic.heavy.d': '砲兵の攻撃力 +40%、爆発範囲拡大',
    'relic.shield': '鉄壁の盾', 'relic.shield.d': '全ユニットの最大HP +25%',
    'relic.gold': '黄金の手', 'relic.gold.d': 'ゴールド獲得 +60%',
    'relic.wall': '城壁補強', 'relic.wall.d': '城壁の最大HP +30、即時回復',
    'relic.speed': '高速リール', 'relic.speed.d': 'スピン回復速度 +30%',
    'relic.fever': 'フィーバーコア', 'relic.fever.d': 'フィーバーゲージ +50%',
    'relic.vamp': '吸血の紋章', 'relic.vamp.d': 'ユニットが与えたダメージの10%を回復',
    'relic.thunder': '雷撃のルーン', 'relic.thunder.d': '6秒毎に雷が敵3体を撃つ',
    'relic.command': '指揮官の旗', 'relic.command.d': '全ユニットの攻撃力 +20%',
    'relic.crit': '致命の眼', 'relic.crit.d': '会心率 +15%、会心ダメージ2.5倍',
    'relic.bounty': '賞金台帳', 'relic.bounty.d': '敵撃破ごとにゴールド +2',
    'relic.holy': '聖剣の覚醒', 'relic.holy.d': '全ユニットの攻撃力・HP +35%、黄金のオーラ',

    'quest.title': '戦術ミッション',
    'quest.m1': 'リロール後に2マッチ以上', 'quest.m2': '城壁ノーダメージでウェーブクリア',
    'quest.m3': '2リール固定で3マッチ', 'quest.m4': 'リロール1回以下でウェーブクリア',
    'quest.m5': 'このウェーブで3段階ユニット完成', 'quest.m6': 'ボス出現から20秒以内に撃破',
    'quest.m7': '落雷・メテオで{n}体撃破', 'quest.m8': '2リール固定でウェーブクリア',
    'quest.reward.bolt': '⚡ 落雷 +1', 'quest.reward.meteor': '🔥 メテオ +1',
    'quest.reward.rerollFree': '無料リロール +{n}',
    'slot.free': '無料', 'ord.empty': 'チャージされた特殊アイテムがありません',
    'ord.boltTitle': '落雷（Q）— ミッション報酬でチャージ', 'ord.meteorTitle': 'メテオ（E）— ミッション報酬でチャージ',
    'quest.reward.heal': '城壁 +{n}', 'quest.reward.charge': 'スピン +{n}',
    'zone.1': '城門の前哨', 'zone.2': '霧の森', 'zone.3': '炎の峡谷', 'zone.4': '暗黒の砦', 'zone.5': '最終城塞',
    'zone.desc.1': '城門を守れ', 'zone.desc.2': '霧の射手たち', 'zone.desc.3': '炎が迫る',
    'zone.desc.4': '闇の軍団', 'zone.desc.5': '最後の城塞', 'zone.map': '戦場進行',
    'slot.needGold': 'ゴールドが足りません',
    'quest.reward.reroll': 'リロール +{n}', 'quest.done': '達成',

    'gameover.kicker': 'DEFEAT', 'gameover.title': '城壁が崩れた',
    'gameover.score': '最終スコア', 'gameover.wave': '到達ウェーブ',
    'gameover.kills': '撃破', 'gameover.promos': '昇級', 'gameover.relics': '遺物',
    'gameover.best': '最高スコア',

    'stat.score': 'スコア', 'stat.wave': 'ウェーブ', 'stat.gold': 'ゴールド',
    'stat.kills': '撃破', 'stat.promos': '昇級', 'stat.relics': '遺物',
    'stat.hp': '城壁', 'stat.units': 'ユニット',

    'howto.title': '遊び方',
    'howto.s1t': 'スピン', 'howto.s1d': 'スピンでリールを回してユニットを召喚。リール1·2·3は上からレーン1·2·3に対応。',
    'howto.s2t': 'マッチ', 'howto.s2d': '同じシンボル2つでボーナス、3つでジャックポット！ 2段階ユニット3体を召喚。',
    'howto.s3t': '昇級', 'howto.s3d': '同じレーンに同じユニットが出ると合体し、大きく強くなる。',
    'howto.s4t': 'ホールド / リロール', 'howto.s4d': 'リールをタップで固定。ゴールドで引き直せます。ウェーブが上がるほど、連続で回すほど高くなります。',
    'howto.s5t': '遺物', 'howto.s5d': 'ウェーブクリア毎に遺物3つから1つ選び、シナジーを組む。',

    'howto.s6t': '特殊スロット', 'howto.s6d': '落雷・メテオのシンボルが出ると戦場を一掃します。ミッションでチャージした ⚡🔥 はボタン（Q/E）で発動できます。',
    'howto.s7t': '戦術ミッション', 'howto.s7d': 'ホールド・リロール・ノーダメージ突破などの戦術目標を達成すると、落雷チャージ・無料リロール・城壁修理を獲得します。',
    'vip.kicker': 'STARTER PACK', 'vip.title': 'VIPスターターパック',
    'vip.desc': '伝説の遺物「聖剣の覚醒」と黄金スキンを即時解放。無料プレイには影響しません。',
    'vip.pack': 'VIPパックを見る', 'vip.code': '体験コード', 'vip.placeholder': 'コードを入力',
    'vip.enter': '登録', 'vip.success': '伝説の遺物を解放しました！',
    'vip.invalid': '無効なコードです', 'vip.already': 'すでに登録済みのコードです',
    'vip.hint': '体験コード：MOA-SLOT-2026', 'vip.relicName': '聖剣の覚醒',
    'vip.relicDesc': '全ユニットの攻撃力・HP +35%、黄金のオーラ',
    'vip.unlocked': 'VIP解放済み', 'vip.relicToast': '聖剣が目覚めた',

    'toast.promo': '昇級！ {tier} {unit}', 'toast.relic': '遺物獲得：{name}',
    'toast.quest': 'ミッション達成！ {reward}', 'toast.fever': 'フィーバータイム！',
    'toast.feverEnd': 'フィーバー終了', 'toast.boss': 'ボス接近中',
    'toast.laneFull': 'レーンが満杯です', 'toast.vip': 'VIPスターターパックを解放しました',
    'toast.newBest': '新記録！', 'toast.bossDown': 'ボス撃破 +{n}G',

    'item.frenzy': 'ジャックポット狂乱リール',
    'unit.bolt': '落雷', 'unit.meteor': 'メテオ', 'unit.paladin': '聖騎士', 'unit.frenzy': '狂乱',
    'unit.bolt.d': '画面の全敵を一撃（最大HPの30%＋固定ダメージ、1.1秒スタン）',
    'unit.meteor.d': '敵が多いレーンにメテオを落とし、範囲ダメージと強いノックバック',
    'unit.paladin.d': '3段階の黄金聖騎士を召喚。単独でレーンを押し上げるプレミアムユニット',
    'unit.frenzy.d': '9秒間マッチ率が大幅に上がり、スピン充電が1.6倍に',
    'fx.bolt': '⚡ 落雷', 'fx.meteor': '🔥 メテオ', 'fx.frenzy': '💎 ジャックポット狂乱',
    'fx.frenzySub': '9秒間マッチ率が急上昇',
    'toast.bolt': '落雷！ 敵 {n} 体を直撃', 'toast.meteor': 'メテオ砲撃！',
    'toast.paladin': '黄金聖騎士が参戦！', 'toast.frenzy': 'ジャックポット狂乱 9秒！',
    'trial.kicker': 'FREE TRIAL', 'trial.title': '伝説スロット体験',
    'trial.sub': '今回のゲーム限定 — 黄金聖騎士 · ジャックポット狂乱',
    'trial.chip': '伝説スロット体験中', 'trial.over': '伝説スロット体験終了',
    'trial.cta': '🔒 VIPパックで伝説スロットを編成',
    'deck.kicker': 'SLOT CODEX', 'deck.title': 'スロット図鑑 · 編成',
    'deck.sub': '基本の特殊スロットは誰でも、伝説スロットはVIPパックで編成されます。',
    'deck.open': 'スロット図鑑', 'deck.free': '基本編成', 'deck.owned': '編成済み',
    'deck.trial': '体験可能', 'deck.locked': '🔒 ロック中', 'deck.unlock': 'VIPパックを見る',
    'deck.trialNote': '伝説スロットは最初のゲームの1〜2ウェーブで1回無料体験できます。',
    'deck.vipNote': 'VIP解放済み — 伝説スロットがデッキに編成されています。',
    'deck.lockedNote': '伝説スロットはVIPパックコードで編成されます。体験は1ゲーム1回。',
    'revive.kicker': 'あと少し！', 'revive.free': '⚡ 落雷補給でウェーブを続ける',
    'revive.note': 'デモ · 今回のラン1回無料', 'revive.vip': '伝説スロットで続ける',
    'revive.vipLocked': '伝説スロットを解放して再挑戦', 'revive.ok': '城壁復旧！落雷が降り注ぐ',
    'revive.used': '無料補給は使用済みです',
    'footer.hint': 'SPACE: スピン · 1/2/3: 固定 · M: ミュート · リール1·2·3 = レーン1·2·3'
  };

  const DICT = { ko, en, zh, ja };
  let cur = 'ko';

  function t(key, params) {
    const d = DICT[cur] || ko;
    let s = d[key];
    if (s == null) s = ko[key];
    if (s == null) return key;
    if (params) {
      for (const k in params) s = s.split('{' + k + '}').join(String(params[k]));
    }
    return s;
  }

  function apply(root) {
    const scope = root || document;
    scope.querySelectorAll('[data-i18n]').forEach(function (el) {
      const k = el.getAttribute('data-i18n');
      el.textContent = t(k);
    });
    scope.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    });
    scope.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
      const k = el.getAttribute('data-i18n-title');
      if (k === 'ui.mute' || k === 'ui.unmute') {
        el.setAttribute('aria-label', t(k));
      }
    });
    document.documentElement.setAttribute('lang', cur === 'zh' ? 'zh-CN' : cur);
    document.getElementById('app').setAttribute('data-lang', cur);
  }

  function setLang(l) {
    if (!DICT[l]) return;
    cur = l;
    apply();
    try { localStorage.setItem('moa.ss.lang', l); } catch (e) {}
    document.querySelectorAll('#langSeg button').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-lang') === l);
    });
    const lbl = document.getElementById('langLabel');
    if (lbl) lbl.textContent = LABEL[l];
    if (window.SB.Audio) window.SB.Audio.setLang(l);
    if (window.SB.Game) window.SB.Game.onLangChange();
  }

  function check() {
    const keys = Object.keys(ko);
    const missing = [];
    LANGS.forEach(function (l) {
      keys.forEach(function (k) { if (DICT[l][k] == null) missing.push(l + ':' + k); });
      Object.keys(DICT[l]).forEach(function (k) { if (ko[k] == null) missing.push(l + ':extra:' + k); });
    });
    return { ok: missing.length === 0, missing: missing, count: keys.length };
  }

  SB.I18n = { t: t, apply: apply, setLang: setLang, getLang: function () { return cur; },
    LANGS: LANGS, LABEL: LABEL, DICT: DICT, check: check };
})();
