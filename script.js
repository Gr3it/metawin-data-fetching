const { ethers } = require("ethers");
const fs = require("fs");

const status = [
  "created",
  "accepted",
  "early cashout",
  "cancelled",
  "closing requested",
  "ended",
  "cancel requested",
];

const main = async () => {
  const provider = new ethers.providers.InfuraProvider();

  const metawinAddress = "0x8652168693827ff341f2ad5AD9a091f2A975710A";

  const metawinAbi = [
    "function getEntries(uint256) view returns (address[])",
    "function raffles(uint256) view returns (uint8, uint256, address, uint256, address, uint256, uint256, address, uint256, address, uint256, uint256)",
    "event RaffleCreated(uint256 indexed raffleId, address indexed nftAddress, uint256 indexed nftId)",
  ];

  const metawinContract = new ethers.Contract(
    metawinAddress,
    metawinAbi,
    provider
  );

  const array = [];

  const events = await metawinContract.queryFilter("RaffleCreated");
  const lastId = await events[events.length - 1].args.raffleId.toNumber();

  for (i = 0; i <= lastId; i++) {
    const data = await metawinContract.raffles(i);
    const object = {
      id: i,
      status: status[data[0]],
      maxEntryPerUser: data[1].toString(),
      nftAddress: data[2],
      nftId: data[3].toString(),
      winner: data[4],
      extractedNumber: data[5].toString(),
      raisedInWei: data[6].toString(),
      raisedInEther: ethers.utils.formatEther(data[6]),
      platformPercentage: data[8].toString(),
      requiredNFT: data[9],
      totalEntries: data[10].toString(),
      cancellingDate:
        data[11].toString() != 0
          ? new Date(data[11].toString() * 1000).toLocaleString()
          : "fine non impostata",
    };
    array.push(object);

    if (i % 10 == 0) console.log(((i * 100) / lastId).toFixed(2) + " %");
  }

  var csv =
    "id,status,maxEntryPerUser,nftAddress,nftId,winner,extractedNumber,raisedInWei,raisedInEther,platformPercentage,requiredNFT,totalEntries,cancellingDate\n" +
    array
      .map(function (d) {
        return JSON.stringify(Object.values(d));
      })
      .join("\n")
      .replace(/(^\[)|(\]$)/gm, "");

  fs.writeFileSync("FILE.csv", csv);

  console.log("completed");
};

main();
