import pinataSDK from "@pinata/sdk";
import * as dotenv from "dotenv";
import fs from "fs";
import { main } from "./mintNFT";

dotenv.config();

const pinata_key = process.env.PINATA_KEY;
const pinata_secret = process.env.PINATA_SECRET;
let pinata: any;

if (pinata_key && pinata_secret) {
  pinata = pinataSDK(pinata_key, pinata_secret);
} else {
  console.log("environment variables not provided for Pinata");
}

const readableStreamForFile = fs.createReadStream(process.argv[2]);
const fileName = process.argv[3];

const pinJson = async (pinnedFile: any) => {
  if (pinnedFile.IpfsHash && pinnedFile.PinSize > 0) {
    fs.unlinkSync(`./${process.argv[2]}`);

    const metadata = {
      name: fileName,
      description: "Some description",
      symbol: "TUT",
      artifactUri: `ipfs://${pinnedFile.IpfsHash}`,
      displayUri: `ipfs://${pinnedFile.IpfsHash}`,
      creators: "da creator",
      decimals: 0,
      thumbnailUri: "https://tezostaquito.io/img/favicon.png",
      is_transferable: true,
      shouldPreferSymbol: false,
    };

    const res = await pinata.pinJSONToIPFS(metadata, {
      pinataMetadata: {
        name: "TUT-metadata",
      },
    });
    main(res.IpfsHash);
  }
};

const start = async () => {
  if (pinata) {
    const result = await pinata.pinFileToIPFS(readableStreamForFile)!;
    pinJson(result);
  } else {
    console.log("File not Found");
  }
};

start();
