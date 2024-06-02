import {prove} from './utils'

const snarkjs = require('snarkjs');

// You must modify the input signals to include the data you're trying to generate a proof for.
const signals: { [name: string]: number | string } = {
  value1: 1,
  value2: 2,
  value3: 3,
  value4: 4,
  hash: '18821383157269793795438455681495246036402687001665670618754263018637548127333',
};

const main = async () => {
  if (Object.keys(signals).length === 0) {
    console.error("You must modify the input signals to include the data you're trying to generate a proof for.")
    return
  }
  const proofResponse = await prove(signals)
  console.log('Proof:\n', JSON.stringify(proofResponse.proof, null, 2))
  console.log('Proof:\n', JSON.stringify(proofResponse.public, null, 2))

  const calldata = await snarkjs.groth16.exportSolidityCallData(proofResponse.proof, proofResponse.public);
  console.log('Calldata:\n', calldata);
}

main()

