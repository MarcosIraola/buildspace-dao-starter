import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const editionDrop = sdk.getEditionDrop("0x0026Db4182049363C07A085BBBF768320D3BF15E");

(async () => {
  try {
    await editionDrop.createBatch([
      {
        name: "Fire",
        description: "This NFT will give you access to FuegoAustralDAO!",
        image: readFileSync("scripts/assets/Fuego.png"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})();