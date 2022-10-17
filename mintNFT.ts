import { TezosToolkit } from "@taquito/taquito";
import dotenv from "dotenv";
import { InMemorySigner } from "@taquito/signer";
import { char2Bytes } from "@taquito/utils";
import fs from "fs";

dotenv.config();

const userAddress = process.env.WALLET_PUBLIC!;
const private_key = process.env.WALLET_PRIVATE!;

const RPC_URL = "https://ghostnet.tezos.marigold.dev"; // Ghostnet

const tezosClient = new TezosToolkit(RPC_URL);

export function main(ipfsUrl: string) {
  fs.readFile("./contract.json", "utf8", async (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err);
      return;
    }
    const contractAddress = JSON.parse(jsonString).address;
    const signer = await InMemorySigner.fromSecretKey(private_key);
    mint(signer, ipfsUrl, contractAddress);
  });
}

const mint = (signer: any, ipfsUrl: string, contractAddress: string) => {
  tezosClient.setProvider({ signer: signer });

  tezosClient.wallet.at(contractAddress).then((contract) => {
    contract.methods
      .mint(char2Bytes(ipfsUrl), userAddress)
      .send()
      .then((op) => {
        console.log(op.opHash);
      })
      .catch((err) => console.log(err));
  });
};
