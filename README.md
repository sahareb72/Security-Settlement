# Introduction

Decentralization is the bedrock of blockchain technology, fundamentally transforming the distribution of power and control across network participants. This shift from centralized systems, where control is consolidated, to a distributed architecture, enhances transparency and security by preventing any single party from unilaterally altering information on the blockchain. It enables a democratic system of governance, where all participants contribute to transaction validation, fostering trust and cooperation without the need for a central authority. This not only diminishes the risk of corruption and manipulation but also fortifies the network by spreading the computational load across various nodes. The democratization of control is crucial for applications in financial services, supply chain management, and voting systems, where integrity and equity are paramount (Nakamoto, 2008; Buterin, 2015).

In the context of cross-border payments, decentralization significantly boosts efficiency and security. By minimizing the reliance on intermediaries like banks and clearing houses, blockchain technology can reduce transaction fees and processing times (Tapscott and Tapscott, 2016). This is particularly beneficial for international transactions, where traditional methods involve multiple intermediaries and currency exchanges, leading to increased costs and delays. Additionally, the immutable and transparent nature of blockchain ensures trust among parties globally, mitigating common risks such as fraud and double spending (Swan, 2015).

However, the pervasive decentralization in public blockchains, while beneficial, also introduces challenges, particularly in managing sensitive identity information securely. The absence of centralized oversight in such open systems raises concerns about data protection and privacy breaches. To address these issues, some entities have adopted permissioned or private blockchains, which restrict network access to authorized participants only. This model enhances data security but at the cost of reduced decentralization, as control over the blockchain is somewhat centralized among fewer participants (Catalini and Gans, 2016).

To balance the need for security with the benefits of decentralization, the blockchain community is exploring innovative solutions like Zero Knowledge Proofs (ZKPs). ZKPs allow for the verification of transactions without revealing any underlying data, thus maintaining privacy while upholding the decentralized ethos of blockchain. This technology enables the network to verify the integrity of transactions, ensuring that no single entity has undue control over the blockchain, thus preserving a balanced power distribution across the network (Goldreich, 2001).

Therefore, while permissioned blockchains offer a solution to privacy concerns, they do so at the expense of full decentralization. Zero Knowledge Proofs present a promising approach to achieving high security without compromising the decentralized principles foundational to blockchain technology. This solution supports the development of blockchain applications that are both secure and equitable, maintaining privacy and data integrity across diverse use cases (Sasson et al., 2014).

## Step by Step process

Here's a proofread and slightly refined version of your project demonstration:

We initiated our project by developing a smart contract in Solidity using Hardhat. Our cross-border payment contract incorporated features such as deposit functionality and KYC verification. We integrated KYC verification into a modifier to ensure that only KYC-verified users could execute certain actions.

For the KYC verification, we utilized the hash output from the KYC verification process to develop a zero-knowledge proof setup using Sindri, which is the main contribution of this project. To set up Sindri, we first created an account on the Sindri website and then attempted a test setup using Remix IDE. We established a new workspace of Hash Cher type in Remix IDE and entered the Sindri credentials in the Remix IDE settings.

Next, we used the workspace action to add ZKP scripts to our workspace. We then navigated to the `Sindri.json` file to make necessary modifications, such as changing the compiler to WASM or renaming the circuit based on our preferences. Afterward, we accessed the Scripts>sindri folder and executed the `run_compile.ts` file. This process yielded the following response: "Compiling circuit 'Name'...," and upon completion, it generated a unique ID indicating that a new circuit named "Name" was created in our Sindri account.

Subsequently, we returned to the Remix IDE workspace, and under scripts>sindri, we prepared to run the `run_prove.ts` file. Before executing this file, we adjusted the const signals to include the hash data for the input signals for which we intended to generate the proof. This addition asserted our knowledge of the data encrypted into a specific hash. For instance, we configured the input signals as follows, establishing the hash for the values 1, 2, 3, and 4, and we provided the expected hash to demonstrate our knowledge of the inputs to this hash:

```jsx
const signals: { [name: string]: number | string } = {
  value1: 1,
  value2: 2,
  value3: 3,
  value4: 4,
  hash: '18821383157269793795438455681495246036402687001665670618754263018637548127333',
};

```

Next, we integrated call data for this proof. First, we imported Snark.js and then appended the following calldata code:

```jsx
const calldata = await snarkjs.groth16.exportSolidityCallData(proofResponse.proof, proofResponse.public);
console.log('Calldata:\\n', calldata);
console.log('Proof:\\n', JSON.stringify(proofResponse.public, null, 2));

```

Executing `run_prove.ts` with these modifications provided the proof for the circuit, yielding a response with the proof ID, proof, and calldata.

With the calldata obtained, we proceeded to our Sindri circuit to download the verification Solidity code. We then added this Solidity code to a separate `.sol` file in our Remix IDE workspace, compiled it, and deployed it by setting the contract tab to the verifier. After deployment, we used the calldata from the previous step and pasted it into the verifyproof section to have our proof verified.

This detailed explanation captures the full workflow and contributions of our blockchain project.

## References

- Nakamoto, S. (2008). "Bitcoin: A Peer-to-Peer Electronic Cash System." Read more
- Buterin, V. (2015). "Ethereum: A Next-Generation Smart Contract and Decentralized Application Platform." Read more
- Tapscott, D., & Tapscott, A. (2016). "Blockchain Revolution: How the Technology Behind Bitcoin Is Changing Money, Business, and the World." [Find the book](https://www.amazon.com/Blockchain-Revolution-Technology-Changing-Business/dp/1101980133)
- Swan, M. (2015). "Blockchain: Blueprint for a New Economy." [Find the book](https://www.amazon.com/Blockchain-Blueprint-Economy-Melanie-Swan/dp/1491920491)
- Catalini, C., & Gans, J. S. (2016). "Some Simple Economics of the Blockchain." Read more
- Goldreich, O. (2001). "Foundations of Cryptography." Find the book
- Sasson, E. B., et al. (2014). "Zerocash: Decentralized Anonymous Payments from Bitcoin." Read more
