const CONTRACT_ADDRESS1 = '0xfBEf22E9E3D7B77C7e425bF9dBed95de00CB3b94';
const CONTRACT_ADDRESS = '0x95b5BDd2c7a1da0cd853896d682154Ec25b1Cf1D'

const transformCharacterData = (characterData) => {
  
  fetch(characterData.characterURI)
    .then((res) => res.json())
    .then((resData) => {
      console.log(resData);
      return resData;
    })
    .catch((err) => console.warn(err));
};

export { CONTRACT_ADDRESS, transformCharacterData };
