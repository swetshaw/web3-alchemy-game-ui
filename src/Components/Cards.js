import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../constants';
import alchemyContract from '../utils/BackUpContract.json';

const Cards = (props) => {
  const [characters, setCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);

  const mintNFT = (_charIdx) => async () => {
    try {
      if (gameContract) {
        console.log(' ********* Minting NFT *********');
        const txn = await gameContract.mintNFT(_charIdx);
        await txn.wait();
        console.log('mintTxn:', txn);
      }
    } catch (err) {
      console.warn('Error while minting:', err);
    }
  };

  const combine = async () => {
    if (gameContract) {
      console.log('Combining');
      const txn = await gameContract.combineNFTs(7, 9);
      await txn.wait();
      console.log('combine txn:', txn);
    }
  };

  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        alchemyContract.abi,
        signer
      );

      /*
       * This is the big difference. Set our gameContract in state.
       */
      setGameContract(gameContract);

      console.log('NFTS in card', props.nfts);
    } else {
      console.log('Ethereum object not found');
    }
  }, []);

  useEffect(() => {
    const getCharacters = async () => {
      try {
        console.log('Getting contract characters to mint');

        /*
         * Call contract to get all mint-able characters
         */
        const charactersTxn = await gameContract.getDefaultCharacters();
        console.log('charactersTxn:', charactersTxn);

        /*
         * Go through all of our characters and transform the data
         */
        // const characters = charactersTxn.map((characterData) =>
        //   transformCharacterData(characterData).then((response) => {
        //     return response;
        //   })
        // );
        // let data = [];
        // for (let i = 0; i < charactersTxn.length; i++) {
        //   // try {
        //   //   let response = await fetch(charactersTxn[i].characterURI);
        //   //   // console.log(await response.json());
        //   //   let d = await response.json();
        //   //   data.push(d);
        //   //   setCharacters(data)
        //   //   console.log('Characters -->', characters);
        //   //   console.log(data);
        //   // } catch (e) {
        //   //   console.error(e);
        //   // }

        // }

        Promise.all(
          charactersTxn.map((url) =>
            fetch(url.characterURI)
              .then((res) => res.json())
              .then((data) => {
                return data;
              })
          )
        ).then((data) => {
          console.log('Data ->', data);
          setCharacters(data);
          console.log('Characters', characters);
        });
        /*
         * Set all mint-able characters in state
         */
        // setCharacters(data);
        // console.log('Characters -->', characters);
      } catch (error) {
        console.error('Something went wrong fetching characters:', error);
      }
    };

    const onCharacterMint = async (sender, tokenId, characterIndex) => {
      alert(
        `Your NFT is all done -- see it here: https://testnets.opensea.io/assets/${
          gameContract.address
        }/${tokenId.toNumber()}`
      );
      console.log(
        `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
      );

      /*
       * Once our character NFT is minted we can fetch the metadata from our contract
       * and set it in state to move onto the Arena
       */
      if (gameContract) {
        const characterNFTtxn = await gameContract.getUserNFTS();
        console.log('CharacterNFT: ', characterNFTtxn);
        if (characterNFTtxn.length > 0) {
          console.log('User has character NFT', characterNFTtxn);
          Promise.all(
            characterNFTtxn.map((url) =>
              fetch(url.characterURI)
                .then((res) => res.json())
                .then((data) => {
                  data = {...data, tokenId: url.tokenId}
                  return data;
                })
            )
          ).then((data) => {
            console.log('Data ->', data);
            props.setNfts(data);
          });
        } else {
          console.log('No character NFT found');
        }
      }
    };

    /*
     * If our gameContract is ready, let's get characters!
     */
    if (gameContract) {
      getCharacters();
      gameContract.on('CharacterNFTMinted', onCharacterMint);
    }

    return () => {
      if (gameContract) {
        gameContract.off('CharacterNFTMinted', onCharacterMint);
      }
    };
  }, [gameContract]);

  const renderCharacters = () => {
    return characters.map((character, index) => (
      <div className='bg-white p-4 flex flex-col gap-2' key={index}>
        <div>
          <p className='font-bold text-lg'>{character.name}</p>
          <p className='font-bold text-lg'>{character.description}</p>
        </div>
        <img src={character.image} alt={character.name} />

        {character.attributes.map((attr, idx) => (
          <div>
            <p
              key={idx}
              className='font-semibold'
            >{`${attr.trait_type} : ${attr.value}`}</p>
          </div>
        ))}
        <button
          type='button'
          className='rounded-md bg-lime-400 p-2 font-bold'
          onClick={mintNFT(index)}
        >{`Mint `}</button>
      </div>
    ));
  };

  const renderUserNFTS = () => {
    return props.nfts.map((nft, index) => (
      <div className='bg-white p-4 flex flex-col gap-2' key={index}>
        <div>
          <p className='font-bold text-lg'>{nft.name}</p>
        </div>
        <img src={nft.image} alt={nft.name} />

        {nft.attributes.map((attr, idx) => (
          <div>
            <p
              key={idx}
              className='font-semibold'
            >{`${attr.trait_type} : ${attr.value}`}</p>
          </div>
        ))}
        <p className='font-bold text-lg'>Token Id: {nft.tokenId.toNumber()}</p>
      </div>
    ));
  };

  return (
    <div className='flex flex-col gap-8 mt-8'>
      <h2 className='text-xl font-bold text-amber-400'>Mint your Character</h2>
      <div className='flex gap-4 justify-evenly'>{renderCharacters()}</div>
      <h2 className='text-xl font-bold text-amber-400'>
        You own following Characters:
      </h2>
      <div className='flex flex-wrap gap-4 justify-evenly'>{renderUserNFTS()}</div>
      <button
        type='button'
        className='rounded-md bg-lime-400 p-2 text-2xl font-bold'
        onClick={combine}
      >
        Combine
      </button>
    </div>
  );
};

export default Cards;
