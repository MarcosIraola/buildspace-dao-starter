import { useAddress, useMetamask, useEditionDrop, useToken  } from '@thirdweb-dev/react';
import { useState, useEffect, useMemo } from 'react';



const App = () => {
  
    // Use the hooks thirdweb give us.
    const address = useAddress();
    const connectWithMetamask = useMetamask();

    const token = useToken("0x35D14c46da0411687CEFf6ACC06e101f88133AfE");

    console.log("👋 Address:", address);

    // Initialize our editionDrop contract
    const editionDrop = useEditionDrop("0x0026Db4182049363C07A085BBBF768320D3BF15E");
    // State variable for us to know if user has our NFT.
    const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
    // isClaiming lets us easily keep a loading state while the NFT is minting.
    const [isClaiming, setIsClaiming] = useState(false);

    // Holds the amount of token each member has in state.
    const [memberTokenAmounts, setMemberTokenAmounts] = useState([]);
    // The array holding all of our members addresses.
    const [memberAddresses, setMemberAddresses] = useState([]);

    // A fancy function to shorten someones wallet address, no need to show the whole thing. 
    const shortenAddress = (str) => {
        return str.substring(0, 6) + "..." + str.substring(str.length - 4);
    };

    // This useEffect grabs all the addresses of our members holding our NFT.
    useEffect(() => {
        if (!hasClaimedNFT) {
            return;
        }
    
        // Just like we did in the 7-airdrop-token.js file! Grab the users who hold our NFT
        // with tokenId 0.
        const getAllAddresses = async () => {
        try {
            const memberAddresses = await editionDrop.history.getAllClaimerAddresses(0);
            setMemberAddresses(memberAddresses);
            console.log("🚀 Members addresses", memberAddresses);
        } catch (error) {
            console.error("failed to get member list", error);
        }
    
        };
        getAllAddresses();
    }, [hasClaimedNFT, editionDrop.history]);

    // This useEffect grabs the # of token each member holds.
    useEffect(() => {
        if (!hasClaimedNFT) {
        return;
        }
    
        const getAllBalances = async () => {
        try {
            const amounts = await token.history.getAllHolderBalances();
            setMemberTokenAmounts(amounts);
            console.log("👜 Amounts", amounts);
        } catch (error) {
            console.error("failed to get member balances", error);
        }
        };
        getAllBalances();
    }, [hasClaimedNFT, token.history]);

    const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
        // We're checking if we are finding the address in the memberTokenAmounts array.
        // If we are, we'll return the amount of token the user has.
        // Otherwise, return 0.
        const member = memberTokenAmounts?.find(({ holder }) => holder === address);
    
        return {
            address,
            tokenAmount: member?.balance.displayValue || "0",
            }
        });
    }, [memberAddresses, memberTokenAmounts]);

    useEffect(() => {
        // If they don't have an connected wallet, exit!
        if (!address) {
          return;
        }
    
        const checkBalance = async () => {
          try {
            const balance = await editionDrop.balanceOf(address, 0);
            if (balance.gt(0)) {
              setHasClaimedNFT(true);
              console.log("🌟 this user has a membership NFT!");
            } else {
              setHasClaimedNFT(false);
              console.log("😭 this user doesn't have a membership NFT.");
            }
          } catch (error) {
            setHasClaimedNFT(false);
            console.error("Failed to get balance", error);
          }
        };
        checkBalance();
    }, [address, editionDrop]);

    const mintNft = async () => {
        try {
            setIsClaiming(true);
            await editionDrop.claim("0", 1);
            console.log(`🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${editionDrop.getAddress()}/0`);
            setHasClaimedNFT(true);
        } catch (error) {
            setHasClaimedNFT(false);
            console.error("Failed to mint NFT", error);
        } finally {
            setIsClaiming(false);
        }
    };


    if (!address) {
        return (
        <div className="landing">
            <h1>FuegoAustral DAO</h1>
            <button onClick={connectWithMetamask} className="btn-hero">
                Connect your wallet
            </button>
        </div>
        );
    }

    // If the user has already claimed their NFT we want to display the interal DAO page to them
    // only DAO members will see this. Render all the members + token amounts.
    if (hasClaimedNFT) {
        return (
          <div className="member-page">
            <h1>Fuego Austral DAO <br/> 🔥 members page 🔥 <br/> </h1>
            <span>Rest of it comming soon.</span>
            <span>Por ahora, se conecta la wallet, se mintea un nft y se puede recibir un airdop.</span>
            <div>
              <div>
                <h2>Member List</h2>
                <span>Estos son los miembros que claimearon un nft para acceder y tienen $FUEGOS 🔥</span>
                <span>(por alguna razon no son todos los holders del nft)</span>
                <table className="card">
                  <thead>
                    <tr>
                      <th>Address</th>
                      <th>Token Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberList.map((member) => {
                      return (
                        <tr key={member.address}>
                          <td>{shortenAddress(member.address)}</td>
                          <td>🔥 - {member.tokenAmount}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
    };
    
    // This is the case where we have the user's address
    // which means they've connected their wallet to our site!
    return (
        <div className="mint-nft">
            <h1>Mint your free 🔥 for the FA-DAO Membership</h1>
            <button
                disabled={isClaiming}
                onClick={mintNft}
            >
                {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
            </button>
        </div>
    );
};

export default App;
