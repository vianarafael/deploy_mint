import dotenv from "dotenv";

import { InMemorySigner } from "@taquito/signer";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";

import fs from "fs";
import { exec } from "child_process";

dotenv.config();

const RPC_URL =
  process.env.RPC_ENDPOINT || "https://ghostnet.tezos.marigold.dev";

const userAddress = process.env.WALLET_PUBLIC;
const userKey = process.env.WALLET_PRIVATE!;

const contractFile = process.argv[2];

const storageFile = {
  ledger: new MichelsonMap(),
  operators: new MichelsonMap(),
  reverse_ledger: new MichelsonMap(),
  metadata: new MichelsonMap(),
  token_metadata: new MichelsonMap(),
  next_token_id: 0,
  admin: userAddress,
};

async function deployContract(tezosClient: TezosToolkit) {
  const op = await tezosClient.contract.originate({
    code: JSON.parse(fs.readFileSync("./output.json").toString()),
    storage: storageFile,
  });
  console.log(
    `Waiting for confirmation of origination for ${op.contractAddress}...`
  );
  const contract = await op.contract();
  let contractInfo = { address: op.contractAddress };
  fs.writeFile("./contract.json", JSON.stringify(contractInfo), (err) =>
    console.log(err)
  );

  fs.unlinkSync("./output.json");
  console.log("output.json deleted");
  return contract;
}

async function main() {
  const tezosClient = new TezosToolkit(RPC_URL);

  const signer = await InMemorySigner.fromSecretKey(userKey);
  tezosClient.setProvider({ signer });

  try {
    exec(
      `ligo compile contract ${contractFile} -e main --michelson-format json >> ./output.json`,
      async () => {
        try {
          await deployContract(tezosClient);
          console.log(`Origination completed.`);
        } catch (error) {
          console.error(error);
        }
      }
    );
    console.log("output.json created");
  } catch {
    (err: string) => console.log(err);
  }
}

main();
