import {
  Button,
  Card,
  CardBody,
  Code,
  Divider,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  ContractCallInputType,
  InitializedUser,
  PaperEmbeddedWalletSdk,
} from "@paperxyz/embedded-wallet-service-sdk";

import {ThirdwebSDK} from "@thirdweb-dev/sdk";
import { ethers } from "ethers";
import { useState } from "react";

interface Props {
  user: InitializedUser | undefined;
}

enum Features {
  GET_WALLET = "GET_WALLET",
  SIGN_MESSAGE = "SIGN_MESSAGE",
  SIGN_T_ETH = "SIGN_T_ETH",
  SIGN_T_GOERLI = "SIGN_T_GOERLI",
  CALL_GASLESS_CONTRACT = "CALL_GASLESS_CONTRACT",
}

const PLACEHOLDER = "The result will appear here";

export const WalletFeatures: React.FC<Props> = ({ user }) => {
  const [loading, setLoading] = useState<Features | null>(null);
  const [result, setResult] = useState<any>(null);
  const wallet = user?.wallet;
  const onResult = (result: any) => {
    setResult((prevState: any) => ({
      ...(prevState || {}),
      ...result,
    }));
  };
  const getAddress = async () => {
    setLoading(Features.GET_WALLET);
    const signer = await wallet?.getEthersJsSigner();
    const address = await signer?.getAddress();
    setLoading(null);
    onResult({
      wallet: address,
    });
    console.log("address", address);
  };

  const signMessage = async () => {
    setLoading(Features.SIGN_MESSAGE);
    const signer = await wallet?.getEthersJsSigner({
      rpcEndpoint: "mainnet",
    });
    const signedMessage = await signer?.signMessage("hello world");
    onResult({
      signedMessage,
    });
    setLoading(null);
    console.log("signedMessage", signedMessage);
  };

  const signTransactionEth = async () => {
    setLoading(Features.SIGN_T_ETH);
    const signer = await wallet?.getEthersJsSigner({
      rpcEndpoint: "mainnet",
    });
    const tx = {
      to: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
      value: ethers.utils.parseEther("0.1"),
    };
    const signedTransactionEth = await signer?.signTransaction(tx);
    onResult({
      signedTransactionEth,
    });
    setLoading(null);
    console.log("signedTransaction", signedTransactionEth);
  };

  const signTransactionGoerli = async () => {
    setLoading(Features.SIGN_T_GOERLI);
    const signer = await wallet?.getEthersJsSigner({
      rpcEndpoint: "goerli",
    });
    const tx = {
      to: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
      value: ethers.utils.parseEther("0.1"),
    };
    const signedTransactionGoerli = await signer?.signTransaction(tx);
    onResult({
      signedTransactionGoerli,
    });
    setLoading(null);
    console.log("signedTransaction", signedTransactionGoerli);
  };

  const callContractGasless = async () => {
    setLoading(Features.CALL_GASLESS_CONTRACT);
    const params = {
      contractAddress: "0x051aafCC99A130b2497883509064A763EDe4d3c5", 
                    // "0xb2369209b4eb1e76a43fAd914B1d29f6508c8aae",
      methodArgs: [user?.walletAddress ?? "", 1, 1],
      methodInterface:
        "function claimTo(address _to, uint256 _tokeIt, uint256 _quantity) external",
    } as ContractCallInputType;
    console.log("params", params);
    try {
      const result = await user?.wallet.gasless.callContract(params);
      console.log("transactionHash", result?.transactionHash);
      onResult({
        gaslessTransactionHash: result?.transactionHash,
      });
    } catch (e) {
      console.error(`something went wrong sending gasless transaction ${e}`);
    } finally {
      setLoading(null);
    }
  };

  const mintThirdwebGasless = async () => {
    const ERC721_CONTRACT = "0x051aafCC99A130b2497883509064A763EDe4d3c5";
  
    const PaperSdk = new PaperEmbeddedWalletSdk({
      clientId: "1e74452f-6ea3-48d3-9bc0-a6e3e2cb5d20",
      chain: "Goerli",
    });

    const initializedUser = await PaperSdk.initializeUser();
    if (!initializedUser) {
      throw new Error("User is not logged in!")
    }
    const signer = await initializedUser.wallet.getEthersJsSigner();
    
    // get thirdweb contract function argument
    const thirdwebSDK = new ThirdwebSDK(signer);
    const quantity = 1;
  
    try {
      const contract = await thirdwebSDK.getContract(ERC721_CONTRACT);
      const preparedClaims = await contract.erc721.claimConditions.prepareClaim(
        quantity,
        true
      );
      const args = await contract.erc721.claimConditions.getClaimArguments(
        user!.walletAddress,
        quantity,
        preparedClaims
      );
      console.log("args", args);
    } catch (e) {
      console.error("error fetching", e);
    }
    // Todo: function to flatten args
    // right now, thirdweb contract args contains object which needs to be manually flattened into something like
    const argstemp = [
      "0x01921fde091A964b712843762C878F5C5b6cc69c",
      1,
      "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      0,
      [
        ["0x0000000000000000000000000000000000000000000000000000000000000000"],
        1,
        0,
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      ],
      [],
    ];

    // Calling a thirdweb nft drop contract
    const { transactionHash } = await initializedUser.wallet.gasless.callContract({
      contractAddress: ERC721_CONTRACT,
      methodArgs: argstemp,
      // you can grab this by finding the claim method in the thirdweb contract
      methodInterface:
        "function claim(address _receiver,uint256 _quantity,address _currency,  uint256 pricePerToken, tuple(bytes32[] proof, uint256 quantityLimitPerWallet, uint256 pricePerToken, address currency) calldata _allowlistProof,bytes memory _data) public payable virtual override",
    });
    console.log("transactionHash", transactionHash);
  };

  return (
    <Card bg="white" borderRadius={8}>
      <CardBody>
        <Heading size="md">Wallet Features</Heading>
        <Divider my={4} />
        <Stack spacing={4} divider={<Divider />}>
          <Stack>
            <Button
              onClick={getAddress}
              colorScheme="blue"
              isLoading={loading === Features.GET_WALLET}
            >
              Get Wallet Address
            </Button>
            <Code borderRadius={8} p={4}>
              {result?.wallet ? (
                <Link
                  isExternal
                  textDecoration="underline"
                  href={`https://mumbai.polygonscan.com/address/${result.wallet}`}
                >
                  {result.wallet}
                </Link>
              ) : (
                <Text color="gray.500" fontStyle="italic" size="sm">
                  {PLACEHOLDER}
                </Text>
              )}
            </Code>
          </Stack>
          <Stack>
            <Button
              onClick={signMessage}
              colorScheme="blue"
              isLoading={loading === Features.SIGN_MESSAGE}
            >
              Sign Message
            </Button>
            <Code borderRadius={8} p={4} width="full">
              {result?.signedMessage || (
                <Text color="gray.500" fontStyle="italic" size="sm">
                  {PLACEHOLDER}
                </Text>
              )}
            </Code>
          </Stack>
          <Stack>
            <Button
              onClick={signTransactionEth}
              colorScheme="blue"
              isLoading={loading === Features.SIGN_T_ETH}
            >
              Sign Transaction (Eth)
            </Button>
            <Code borderRadius={8} p={4} width="full">
              {result?.signedTransactionEth || (
                <Text color="gray.500" fontStyle="italic" size="sm">
                  {PLACEHOLDER}
                </Text>
              )}
            </Code>
          </Stack>
          <Stack>
            <Button
              onClick={signTransactionGoerli}
              colorScheme="blue"
              isLoading={loading === Features.SIGN_T_GOERLI}
            >
              Sign Transaction (Goerli)
            </Button>
            <Code borderRadius={8} p={4} width="full">
              {result?.signedTransactionGoerli || (
                <Text color="gray.500" fontStyle="italic" size="sm">
                  {PLACEHOLDER}
                </Text>
              )}
            </Code>
          </Stack>
          <Stack>
            <Button
              onClick={callContractGasless}
              colorScheme="blue"
              isLoading={loading === Features.CALL_GASLESS_CONTRACT}
            >
              Call contract method (Gasless)
            </Button>
            <Code borderRadius={8} p={4} width="full">
              {result?.gaslessTransactionHash ? (
                <Link
                  isExternal
                  textDecoration="underline"
                  href={`https://mumbai.polygonscan.com/tx/${result.gaslessTransactionHash}`}
                >
                  {result.gaslessTransactionHash}
                </Link>
              ) : (
                <Text color="gray.500" fontStyle="italic" size="sm">
                  {PLACEHOLDER}
                </Text>
              )}
            </Code>
          </Stack>
          <Stack>
            <Button
              onClick={mintThirdwebGasless}
              colorScheme="blue"
              isLoading={loading === Features.CALL_GASLESS_CONTRACT}
            >
              Claim contract method (Gasless)
            </Button>
            <Code borderRadius={8} p={4} width="full">
              {result?.gaslessTransactionHash ? (
                <Link
                  isExternal
                  textDecoration="underline"
                  href={`https://mumbai.polygonscan.com/tx/${result.gaslessTransactionHash}`}
                >
                  {result.gaslessTransactionHash}
                </Link>
              ) : (
                <Text color="gray.500" fontStyle="italic" size="sm">
                  {PLACEHOLDER}
                </Text>
              )}
            </Code>
          </Stack>
        </Stack>
      </CardBody>
    </Card>
  );
};
