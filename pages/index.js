import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";

import { ethers } from "ethers";
import { useEffect, useState } from "react";
import Web3Modal from "web3modal";
import axios from "axios";
import { nftaddress, nftmarketaddress, nftABI, nftmarketABI } from "../config";

//Todo: ABIs
// import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
// import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [nfts, setNfts] = useState([]);
  // const [loadingState, setLoadingState] = useState("not-loaded");

  useEffect(() => {
    loadNFTs();
  }, []);
  async function loadNFTs() {
    const provider = new ethers.providers.Web3Provider(
      window.ethereum,
      "goerli"
    );

    // const provider = new ethers.providers.JsonRpcProvider();

    const tokenContract = new ethers.Contract(nftaddress, nftABI, provider);
    // const tokenContract = new ethers.Contract(nftaddress, nftABI.abi, signer);

    const marketContract = new ethers.Contract(
      nftmarketaddress,
      nftmarketABI,
      provider
    );

    const data = await marketContract.fetchMarketItems();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId); //tokenURI(tokenId)
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");

        let item = {
          price,
          // : i.price.toString(),
          tokenId: i.tokenId.toString(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
          tokenUri,
        };
        return item;
      })
    );
    //
    setNfts(items);
    setLoadingState("loaded");

    //
  }

  if (loadingState == "loaded" && !nfts.length)
    return (
      <h1 className="px-20 py-10 text-3xl"> No items in the marketplace</h1>
    );

  async function buyNFT(nft) {
    const web3modal = new web3modal();
    const connection = await web3modal.connect();

    const provider = new ethers.Web3Provider(connection);

    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

    const transaction = await contract.createMarketSale(
      nftaddress,
      nft.tokenId,
      { value: price }
    );

    await transaction.wait();

    loadNFTs();
  }

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="">
        <div className="flex justify-center">
          <div className="px-4" style={{ maxWidth: "1600px" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {nfts.map((nft, i) => (
                <div
                  key={i}
                  className="border shadow rounded-xl overflow-hidden"
                >
                  <img src={nft.image} alt="" />
                  <div className="p-4">
                    <p
                      style={{ height: "64px" }}
                      className="text-2xl font-semibold"
                    >
                      {nft.name}
                    </p>
                    <div style={{ eight: "70px", overflow: "hidden" }}>
                      <p className="text-gray-400">{nft.description}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-black">
                    <p className="text-2xl mb-4 font-bold text-white">
                      {nft.price} ETH
                    </p>
                    <button className="w-full bg-pink-700 text-white font-bold py-2 px-12 rounded">
                      Buy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
