const CONTRACT_ADDRESS1 = '0xfBEf22E9E3D7B77C7e425bF9dBed95de00CB3b94';
const CONTRACT_ADDRESS = '0x0f3CAfd6CF7a9EC2C4f251A9c331d90F088fe96D'

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
