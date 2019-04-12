export interface MinimalDotaMatch {
    match_id: number
    duration: number
    start_time: number
}

export interface DotaMatch {
    match_id: number
    player_slot: number
    radiant_win: boolean
    duration: number
    game_mode: number
    lobby_type: number
    hero_id: number
    start_time: number
    version?: null
    kills: number
    deaths: number
    assists: number
    skill: number
    xp_per_min: number
    gold_per_min: number
    hero_damage: number
    tower_damage: number
    hero_healing: number
    last_hits: number
    lane?: null
    lane_role?: null
    is_roaming?: boolean
    cluster: number
    leaver_status: number
    party_size?: null
}