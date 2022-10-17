import pinataSDK from "@pinata/sdk";
import * as dotenv from "dotenv";
import fs from "fs";

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

if (pinata) {
  pinata
    .pinFileToIPFS(readableStreamForFile)
    .then((result: any) => {
      pinJson(result);
    })
    .catch((err: any) => {
      console.log(err);
    });
} else {
  console.log("File not Found");
}

const pinJson = (pinnedFile: any) => {
  if (pinnedFile.IpfsHash && pinnedFile.PinSize > 0) {
    fs.unlinkSync(`./${process.argv[2]}`);

    const metadata = {
      name: fileName,
      description: "Some description",
      symbol: "TUT",
      artifactUri: `ipfs://${pinnedFile.IpfsHash}`,
      displayUri: `ipfs://${pinnedFile.IpfsHash}`,
      creators: "huge",
      decimals: 0,
      thumbnailUri: "https://tezostaquito.io/img/favicon.png",
      is_transferable: true,
      shouldPreferSymbol: false,
    };

    pinata
      .pinJSONToIPFS(metadata, {
        pinataMetadata: {
          name: "TUT-metadata",
        },
      })
      .then((res: any) => {
        console.log(res);
      });
    console.log(metadata);
  }
};
