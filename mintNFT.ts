import { TezosToolkit } from "@taquito/taquito";
import dotenv from "dotenv";
import { InMemorySigner } from "@taquito/signer";
import { char2Bytes } from "@taquito/utils";
dotenv.config();

const userAddress = process.env.WALLET_PUBLIC!;
const private_key = process.env.WALLET_PRIVATE!;
const contractAddress = "KT19LG8vR2HZWiTLNBxU6yteWnnhSZ83vqZ1";

const RPC_URL = "https://ghostnet.tezos.marigold.dev"; // Ghostnet
if (process.argv.length < 3) throw "ipfs hash required";
let ipfsHash = process.argv[2];

let ipfsUrl = "ipfs://" + ipfsHash;
const tezosClient = new TezosToolkit(RPC_URL);
// export const main = (ipfsHash: string) => {

// };

const mint = (signer: any) => {
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

InMemorySigner.fromSecretKey(private_key).then(mint);
