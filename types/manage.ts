export interface CacheGroupStats {
  entryCount: number;
  sizeBytes: number;
}

export interface AllCacheStats {
  play: CacheGroupStats;
  http: CacheGroupStats;
  lyrics: CacheGroupStats;
  wasm: CacheGroupStats;
}
