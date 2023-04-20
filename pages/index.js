import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);

  const [joinedWhitelist, setJoinedWhitelist] = useState(false);

  const [loading, setLoading] = useState(false);

  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);

  const web3ModalRef = useRef();

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();

    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 9000) {
      window.alert("Change the network to Goerli");

      throw new Error("Change network to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();

      return signer;
    }
    return web3Provider;
  };

  const addAddressToWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );

      const tx = await whitelistContract.addAddressToWhitelist();

      setLoading(true);

      await tx.wait();

      setLoading(false);

      await getNumberOfWhitelisted();

      setJoinedWhitelist(true);
    } catch (err) {
      console.error(err);
    }
  };

  const getNumberOfWhitelisted = async () => {
    try {
      const provider = await getProviderOrSigner();

      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );

      const _numberOfWhitelisted =
        await whitelistContract.numAddressesWhitelisted();

      setNumberOfWhitelisted(_numberOfWhitelisted);
    } catch (err) {
      console.error(err);
    }
  };

  const checkIfAddressInWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );

      const address = await signer.getAddress();

      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
        address
      );
      setJoinedWhitelist(_joinedWhitelist);
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();

      setWalletConnected(true);

      checkIfAddressInWhitelist();

      getNumberOfWhitelisted();
    } catch (err) {
      console.error(err);
    }
  };

  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhitelist) {
        return (
          <div className={styles.description}>
            Thanks for joining the Whitelist!
          </div>
        );
      } else if (loading) {
        return (
          <div class={styles.neon__button}>
            <a href="#">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              Loading..
            </a>
          </div>
        );
      } else {
        return (
          <div class={styles.neon__button} onClick={addAddressToWhitelist}>
            <a href="#">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              Join the Whitelist
            </a>
          </div>
        );
      }
    } else {
      return (
        <div class={styles.neon__button} onClick={connectWallet}>
          <a href="#">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            Connect your wallet
          </a>
        </div>
      );
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>NFT Celestia Whitelist</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Celestia Blockchain</h1>
          <div className={styles.description}>
            It&#39;s an NFT collection for light node runner of project.
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./1.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        <div>Made by duyvo102#3738 with &#10084;&#10084;&#10084;</div>
        <div>
          Node Identity: 12D3KooWMTMwWoXW1HLWNNnS2wzGMYJ21hXLCgjS7TRFy1sYBvgo
        </div>
      </footer>
    </div>
  );
}
