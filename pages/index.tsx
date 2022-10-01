import { useEffect, useState } from 'react';
import { useWallet } from '@cosmos-kit/react';
import { StdFee } from '@cosmjs/amino';
import { assets } from 'chain-registry';
import { AssetList, Asset } from '@chain-registry/types';
import {calculateFee, GasPrice, SigningStargateClient} from '@cosmjs/stargate';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import BigNumber from 'bignumber.js';
import { chainDenom, chainId, rpc, codeId } from '../config';
import { GenericAuthorization } from "cosmjs-types/cosmos/authz/v1beta1/authz";
import { MsgGrant } from "cosmjs-types/cosmos/authz/v1beta1/tx";
import { StakeAuthorization } from "cosmjs-types/cosmos/staking/v1beta1/authz";

console.log('aloha top of index.tsx')
import {
  Box,
  Divider,
  Grid,
  Heading,
  Text,
  Stack,
  Container,
  Link,
  Button,
  Flex,
  Icon,
  useColorMode,
  useColorModeValue
} from '@chakra-ui/react';
import { BsFillMoonStarsFill, BsFillSunFill } from 'react-icons/bs';
import { dependencies, products } from '../config';

import { WalletStatus } from '@cosmos-kit/core';
import { Product, Dependency, WalletSection } from '../components';
import { cosmos } from 'juno-network';
import Head from 'next/head';

const library = {
  title: 'Juno Network',
  text: 'Typescript libraries for the Juno ecosystem',
  href: 'https://github.com/CosmosContracts/typescript'
};

const defaultGasPrice = GasPrice.fromString(`0.025${chainDenom}`)
const chainName = 'juno';
const chainassets: AssetList = assets.find(
  (chain) => chain.chain_name === chainName
) as AssetList;
const coin: Asset = chainassets.assets.find(
  (asset) => asset.base === chainDenom
) as Asset;

const instantiateYieldCat = async (
    getSigningStargateClient: () => Promise<SigningCosmWasmClient>,
    setResp: (s: string) => any,
    address: string,
    croncatAddress: string,
    yieldmosAddress: string
) => {
  // TODO: do this the non-hardcoded way, similar to the comment out stuff below
  // can search for the below and see stuffs
  // let rpcEndpoint = await currentWallet?.getRpcEndpoint();
  // @ts-ignore
  const offlineSigner = await window.getOfflineSignerAuto(chainId);
  const cosmwasmClient = await SigningCosmWasmClient.connectWithSigner(
      rpc, // hardcoded, brah, lfg hackerthong
      offlineSigner
  );
  // const cosmwasmClient = await getSigningStargateClient();
  if (!cosmwasmClient || !address) {
    console.error('cosmwasmClient undefined or address undefined.');
    return;
  }
  console.log('aloha end user address:', address)
  const instantiateMsg = { granter: 'aloha', allowed: [croncatAddress, yieldmosAddress] };
  const { contractAddress } = await cosmwasmClient.instantiate(address, Number(codeId), instantiateMsg, 'lfg-yieldcat', calculateFee(500_000, defaultGasPrice))
  console.log('aloha contractAddress', contractAddress)
  // LEFTOFF
  // if (contractAddress) {
  //   setCrontract(setCrontract)
  // }

  // no more brah
  return;

  const fee: StdFee = {
    amount: [],
    gas: '86364'
  };

  const grantMsg = {
    typeUrl: "/cosmos.authz.v1beta1.MsgGrant",
    value: {
      granter: 'juno1gvc0l4upc88arx673tmg7u3g7zsssnyyle5ph5',
      grantee: 'juno1yhqft6d2msmzpugdjtawsgdlwvgq3samrm5wrw',
      grant: {
        authorization: {
          typeUrl: "/cosmos.authz.v1beta1.GenericAuthorization",
          value: GenericAuthorization.encode(
              GenericAuthorization.fromPartial({
                msg: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
              }),
          ).finish(),
        },
      },
    },
  };

  const response = await cosmwasmClient.signAndBroadcast(address, [grantMsg], fee);
  console.log('aloha response', response)
  setResp(JSON.stringify(response, null, 2));
};

export default function Home() {
  const { colorMode, toggleColorMode } = useColorMode();

  const {
    getStargateClient,
    getCosmWasmClient,
    address,
    setCurrentChain,
    currentWallet,
    walletStatus
  } = useWallet();

  useEffect(() => {
    setCurrentChain(chainName);
  }, [chainName]);

  const [balance, setBalance] = useState(new BigNumber(0));
  const [crontract, setCrontract] = useState('');
  const [resp, setResp] = useState('');
  const getBalance = async () => {
    if (!address) {
      setBalance(new BigNumber(0));
      return;
    }

    let rpcEndpoint = await currentWallet?.getRpcEndpoint();

    if (!rpcEndpoint) {
      console.log('no rpc endpoint — using a fallback');
      rpcEndpoint = `https://rpc.cosmos.directory/${chainName}`;
    }

    // get RPC client
    const client = await cosmos.ClientFactory.createRPCQueryClient({
      rpcEndpoint
    });

    // fetch balance
    const balance = await client.cosmos.bank.v1beta1.balance({
      address,
      denom: chainassets?.assets[0].base as string
    });

    // Get the display exponent
    // we can get the exponent from chain registry asset denom_units
    const exp = coin.denom_units.find((unit) => unit.denom === coin.display)
      ?.exponent as number;

    // show balance in display values by exponentiating it
    const a = new BigNumber(balance.balance.amount);
    const amount = a.multipliedBy(10 ** -exp);
    setBalance(amount);
  };

  const color = useColorModeValue('primary.500', 'primary.200');
  return (
    <Container maxW="5xl" py={10}>
      <Head>
        <title>Create Cosmos App</title>
        <meta name="description" content="Generated by create cosmos app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex justifyContent="end" mb={4}>
        <Button variant="outline" px={0} onClick={toggleColorMode}>
          <Icon
            as={colorMode === 'light' ? BsFillMoonStarsFill : BsFillSunFill}
          />
        </Button>
      </Flex>
      <Box textAlign="center">
        <Heading
          as="h1"
          fontSize={{ base: '3xl', sm: '4xl', md: '5xl' }}
          fontWeight="extrabold"
          mb={3}
        >
          Create Cosmos App
        </Heading>
        <Heading
          as="h1"
          fontWeight="bold"
          fontSize={{ base: '2xl', sm: '3xl', md: '4xl' }}
        >
          <Text as="span">Welcome to&nbsp;</Text>
          <Text as="span" color={color}>
            CosmosKit + Next.js +{' '}
            <a href={library.href} target="_blank" rel="noreferrer">
              {library.title}
            </a>
          </Text>
        </Heading>
      </Box>
      <WalletSection chainName={chainName} />

      {walletStatus === WalletStatus.Disconnected && (
        <Box textAlign="center">
          <Heading
            as="h3"
            fontSize={{ base: '1xl', sm: '2xl', md: '2xl' }}
            fontWeight="extrabold"
            m={30}
          >
            Connect your wallet!
          </Heading>
        </Box>
      )}

      {walletStatus === WalletStatus.Connected && (
        <Box textAlign="center">
          <Flex mb={4}>
            <Button
                onClick={instantiateYieldCat
                  // instantiateYieldCat(
                  //     getCosmWasmClient as () => Promise<SigningCosmWasmClient>,
                  //     setResp as () => any,
                  //     address as string,
                  //     'hardcodedCroncatAddress',
                  //     'hardcodedYieldmosAddress'
                  // )
                }
              >Create a YieldCat contract for me</Button>

          </Flex>
          {!!crontract && (
              <>
                <Box>
                  <Text as="span" color="purple.600">
                    Your contract: {crontract}
                  </Text>
                </Box>
              </>
          )}
        </Box>
      )}

      {!!resp && (
        <>
          <Container>Response: </Container>
          <pre>{resp}</pre>
        </>
      )}

      {/*<Dependency key={library.title} {...library}></Dependency>*/}

      <Box mb={3}>
        <Divider />
      </Box>

      <Grid
        templateColumns={{
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)'
        }}
        gap={8}
        mb={14}
      >
        {/*{products.map((product) => (*/}
        {/*  <Product key={product.title} {...product}></Product>*/}
        {/*))}*/}
      </Grid>

      {/*<Grid templateColumns={{ md: '1fr 1fr' }} gap={8} mb={20}>*/}
      {/*  {dependencies.map((dependency) => (*/}
      {/*    <Dependency key={dependency.title} {...dependency}></Dependency>*/}
      {/*  ))}*/}
      {/*</Grid>*/}
      <Box mb={3}>
        <Divider />
      </Box>
      <Stack
        isInline={true}
        spacing={1}
        justifyContent="center"
        opacity={0.5}
        fontSize="sm"
      >
        <Text>Built with TLC</Text>
        <Link
          href="https://cosmology.tech/"
          target="_blank"
          rel="noopener noreferrer"
        >Cosmology flippin' rocks</Link>
      </Stack>
    </Container>
  );
}
