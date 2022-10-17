import { TezosToolkit } from "@taquito/taquito";
import dotenv from "dotenv";
import { InMemorySigner } from "@taquito/signer";
import { char2Bytes } from "@taquito/utils";
import fs from "fs";

dotenv.config();

const userAddress = process.env.WALLET_PUBLIC!;
const private_key = process.env.WALLET_PRIVATE!;

const RPC_URL =
  process.env.RPC_ENDPOINT || "https://ghostnet.tezos.marigold.dev";

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

const mint = async (signer: any, ipfsUrl: string, contractAddress: string) => {
  tezosClient.setProvider({ signer: signer });

  const contract = await tezosClient.wallet.at(contractAddress);
  // .then((contract) =>
  // {
  try {
    const op = await contract.methods
      .mint(char2Bytes(ipfsUrl), userAddress)
      .send();
    // .then((op) => {
    console.log("Transaction", op.opHash);
    // })
  } catch {
    (err: any) => console.log(err);
  }
  // });
};
