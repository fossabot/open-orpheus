import { registerCallHandler } from "../calls";
import { fireNativeCall } from "../channel";
import im from "../nim";

type ImEnterParams = {
  chat_roomid: string;
};

registerCallHandler<[ImEnterParams], void>("im.enter", (params) => {
  (async () => {
    await im.connect();
    await im.joinRoom(params.chat_roomid);
    fireNativeCall("im.onEnter", { code: 200 });
  })();
});

registerCallHandler<[], void>("im.leave", async () => {
  await im.leaveRoom();
  await im.disconnect();
});
