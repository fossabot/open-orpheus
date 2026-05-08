import type {
  MiniPlayerPlayInfo,
  MiniPlayerPlayState,
  MiniPlayerListElement,
  MiniPlayerListData,
  MiniPlayerFullState,
  MiniPlayerStyle,
  MiniPlayerShowVolumeRequest,
} from "$sharedTypes/mini-player";

export type {
  MiniPlayerPlayInfo,
  MiniPlayerPlayState,
  MiniPlayerListElement,
  MiniPlayerListData,
  MiniPlayerFullState,
  MiniPlayerStyle,
  MiniPlayerShowVolumeRequest,
};

export interface MiniPlayerContract {
  events: {
    fullStateUpdate(callback: (state: MiniPlayerFullState) => void): void;
    playInfoUpdate(callback: (info: MiniPlayerPlayInfo | null) => void): void;
    coverUpdate(callback: (url: string | null) => void): void;
    likeUpdate(callback: (liked: boolean) => void): void;
    playStateUpdate(callback: (state: MiniPlayerPlayState) => void): void;
    listUpdate(callback: (data: MiniPlayerListData) => void): void;
    showVolume(callback: (data: MiniPlayerShowVolumeRequest) => void): void;
    styleUpdate(callback: (style: MiniPlayerStyle | null) => void): void;
  };

  requestFullUpdate(): Promise<MiniPlayerFullState>;
  dragWindow(): Promise<void>;
  fireCall(cmd: string, ...args: unknown[]): Promise<void>;
}
