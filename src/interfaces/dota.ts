/**
 * Minimal information from a DotA 2 match relevant for the use of this project.
 */
export interface MinimalDotaMatch {
    player_slot: number
    radiant_win: boolean
    match_id: number
    duration: number
    start_time: number
    kills: number
    deaths: number
    assists: number
    hero_id: number
}

/**
 * A comprehensive list of information from a DotA 2 match.
 *
 * @see https://docs.opendota.com/#tag/players%2Fpaths%2F~1players~1%7Baccount_id%7D~1recentMatches%2Fget
 */
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
