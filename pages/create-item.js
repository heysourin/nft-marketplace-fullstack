import React, { useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { useRouter } from "next/router";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";

// const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

import { nftaddress, nftmarketaddress, nftABI, nftmarketABI } from "../config";
// import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
// import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

const createItem = () => {
  const [fileurl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const router = useRouter();

  //TODO: onChange function
  async function onChange(e) {
    const file = e.target.files[0];

    //Todo: Check for file extension
    try {
      const response = await uploadFileToIPFS(file);
      if (response.success === true) {
        console.log("Uploaded image to Pinata", response.pinataURL);
        setFileUrl(response.pinataURL);
      }
    } catch (error) {
      console.log("Error During Uploading the File", error);
    }
  }

  //TODO: THIS FUNCTION UPLOADS THE DATA TO IPFS
  async function uploadMetadataToIPFS() {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileurl) return;
    /*Upload to IPFS */
    const nftJSON = {
      name,
      description,
      price,
      image: fileurl,
    };

    try {
      const response = await uploadJSONToIPFS(nftJSON);
      if (response.success === true) {
        console.log("Uploaded JSON to Pinata", response);
        return response.pinataURL;
      }
    } catch (error) {
      console.error("Error uploading JSON metadata", error);
    }
  }

  //TODO: List NFT for sale and upload data to IPFS
  async function listNFTForSale() {
    try {
      const metadataURL = await uploadMetadataToIPFS();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      // updateMessage("Please wait.. uploading (upto 5 mins)");

      // let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
      // let transaction = await contract.createToken(url);
      // let tx = await transaction.wait();

      // let event = tx.events[0];
      // let value = event.args[2];
      // let tokenId = value.toNumber();

      //ToDo: NFT contract
      let nftContract = new ethers.Contract(nftaddress, nftABI, signer);
      let nftTransaction = await nftContract.createToken(metadataURL);
      await nftTransaction.wait();

      //TOdo: Marketplace contract
      let contractMarket = new ethers.Contract(
        nftmarketaddress,
        nftmarketABI,
        signer
      );
      let listingPrice = await contractMarket.getListingPrice();
      listingPrice = listingPrice.toString();
      const price = ethers.utils.parseUnits(formInput.price, "ether"); //NFT price

      let transactionMarket = await contractMarket.createMarketItem(
        nftaddress,
        tokenId,
        price,
        {
          value: listingPrice,
        }
      );

      await transactionMarket.wait();
      alert("Successfully listed your NFT!");
      updateFormInput({ name: "", description: "", price: "" });
      router.push("/");
    } catch (error) {
      console.error("Upload error", error);
    }
  }
  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, name: e.target.value })
          }
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, description: e.target.value })
          }
        ></textarea>
        <input
          placeholder="Asset Price in ETH"
          className="mt-2 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, price: e.target.value })
          }
        />
        <input
          type="file"
          placeholder="Asset"
          className="my-4"
          onChange={onChange}
        />

        {fileurl && <img className="rounded mt-4" width="350" src={fileurl} />}

        <button
          onClick={listNFTForSale}
          className="font-bold mt-4 bg-purple-600 text-white rounded p-4 shadow-lg"
        >
          Create Digital Asset
        </button>
      </div>
    </div>
  );
};

export default createItem;
