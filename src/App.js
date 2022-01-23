import logo from './logo.svg';
import './App.css';
import Cards from './Components/Cards';
import React, { useEffect, useState } from 'react';
import alchemyContract from './utils/BackUpContract.json';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';

function App() {
  const [currentAccount, setCurrentAccount] = useState('');
  const [nfts, setNfts] = useState([]);
  const checkIfWalletIsConnected = async () => {
    /*
     * First make sure we have access to window.ethereum
     */
    const { ethereum } = window;

    if (!ethereum) {
      console.log('Make sure you have metamask!');
      return;
    } else {
      console.log('We have the ethereum object', ethereum);
    }

    /*
     * Check if we're authorized to access the user's wallet
     */
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    /*
     * User can have multiple authorized accounts, we grab the first one if its there!
     */
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log('Found an authorized account:', account);
      setCurrentAccount(account);
    } else {
      console.log('No authorized account found');
    }
  };
  // const checkNetwork = async () => {
  //   try {
  //     if (window.ethereum.networkVersion !== '4') {
  //       alert('Please connect to Rinkeby!');
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className='font-bold mt-2 rounded-lg bg-lime-500 p-2'>
      Connect your Wallet
    </button>
  );
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    // checkNetwork();
  }, []);
  useEffect(() => {
    /*
     * The function we will call that interacts with out smart contract
     */
    const fetchUserNFTs = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        alchemyContract.abi,
        signer
      );

      const txn = await gameContract.getUserNFTS();
      if (txn.length > 0) {
        console.log('User has character NFT', txn);
        Promise.all(
          txn.map((url) =>
            fetch(url.characterURI)
              .then((res) => res.json())
              .then((data) => {
                data = {...data, tokenId: url.tokenId}
                return data;
              })
          )
        ).then((data) => {
          console.log('Data ->', data);
          setNfts(data);
        });
      } else {
        console.log('No character NFT found');
      }
    };

    /*
     * We only want to run this, if we have a connected wallet
     */
    if (currentAccount) {
      console.log('CurrentAccount:', currentAccount);
      fetchUserNFTs();
    }
  }, [currentAccount]);

  return (
    <div className='App bg-fuchsia-900 min-h-screen p-4'>
      <h1 className='text-4xl font-extrabold text-lime-400'>
        Welcome To Alchemist
      </h1>
      {currentAccount === '' ? (
        renderNotConnectedContainer()
      ) : (
        <Cards className='w-full' nfts={nfts} setNfts={setNfts} />
      )}
    </div>
  );
}

export default App;
