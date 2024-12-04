import React, { useState, useEffect } from 'react';
import './App.css';

// ฟังก์ชันสุ่มค่าหลอดเลือดในช่วง 10-30
const getRandomHealth = () => Math.floor(Math.random() * (30 - 10 + 1)) + 10;

const App = () => {
    const [account, setAccount] = useState('');
    const [energy, setEnergy] = useState(10);
    const [health, setHealth] = useState(getRandomHealth());
    const [clicks, setClicks] = useState(0);
    const [coins, setCoins] = useState(0); // สถานะสำหรับเก็บจำนวนเหรียญ
    const [hasNFT, setHasNFT] = useState(false);
    const [nfts, setNFTs] = useState([]);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const maxEnergy = 10;
    const maxHealth = 30;

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 3000); // ซ่อนหลัง 3 วินาที
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setEnergy((prev) => Math.min(prev + 1, maxEnergy)); // เพิ่มพลังงานจนถึง 10
        }, 1000);
        return () => clearInterval(interval); // ล้าง interval เมื่อ component ถูก unmount
    }, []);

    const fetchNFTs = async () => {
        try {
            const response = await fetch(`http://localhost:3001/getNFTs?address=${account}`);
            const data = await response.json();
            if (data.success) {
                setNFTs(data.nfts);
            } else {
                console.error('Error fetching NFTs:', data.error);
            }
        } catch (error) {
            console.error('Error fetching NFTs:', error);
        }
    };

    useEffect(() => {
        if (account) {
            fetchNFTs();
        }
    }, [account]);
    


    const checkNFTStatus = async () => {
    try {
        const response = await fetch(`http://localhost:3001/checkNFT?address=${account}`);
        const data = await response.json();
        if (data.success) {
            setHasNFT(data.hasNFT);
        } else {
            console.error('Error checking NFT status:', data.error);
        }
    } catch (error) {
        console.error('Error checking NFT status:', error);
    }
    };

useEffect(() => {
    if (account) {
        checkNFTStatus();
    }
}, [account]);

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]);
                fetchCoins(accounts[0]); // ดึงจำนวนเหรียญเมื่อเชื่อมต่อสำเร็จ
            } catch (error) {
                console.error("Error connecting to MetaMask", error);
            }
        } else {
            showNotification("Please install MetaMask!", 'error');
        }
    };

    const handleClick = () => {
        const Hitsound = new Audio('https://rpg.hamsterrepublic.com/wiki-images/2/21/Collision8-Bit.ogg'); // Play Sound
        Hitsound.play();
        if (energy > 0 && health > 0) {
            setEnergy((prev) => prev - 1);
            setHealth((prev) => Math.max(prev - 1, 0));
            setClicks((prev) => prev + 1);
        }
    };

    const [isClaiming, setIsClaiming] = useState(false);

    const claimTokens = async () => {
      if (health > 0) {
            showNotification("You can't claim tokens until health reaches 0.", 'error');
          return;
      }

        const SSSound = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/descent/gotitem.mp3'); // Play Sound
        SSSound.play();
      setIsClaiming(true); // แสดง Pop-up ระหว่างดำเนินการ
      
      try {
          const response = await fetch('http://localhost:3001/claim', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ address: account }),
          });
          const data = await response.json();
          if (data.success) {
              showNotification(`Tokens claimed successfully! Total clicks: ${clicks}`, 'success');
              fetchCoins(account); // อัปเดตจำนวนเหรียญในกระเป๋า
              resetGame();
          } else {
              showNotification("Error claiming tokens: " + data.error, 'error');
          }
      } catch (error) {
          console.error("Error claiming tokens", error);
      } finally {
          setIsClaiming(false); // ซ่อน Pop-up เมื่อดำเนินการเสร็จสิ้น
      }
  };

    const resetGame = () => {
        setHealth(getRandomHealth()); // สุ่มหลอดเลือดใหม่
        setClicks(0); // รีเซ็ตจำนวนคลิก
    };

    const renderProgressBar = (current, max, color) => {
        const percentage = (current / max) * 100;
        return (
            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                    }}
                ></div>
            </div>
        );
    };

    const [leaderboard, setLeaderboard] = useState([]);

const updateLeaderboard = async () => {
    try {
        const response = await fetch('http://localhost:3001/leaderboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: account, clicks }),
        });
        const data = await response.json();
        if (data.success) {
            fetchLeaderboard(); // อัพเดตข้อมูล Leaderboard
        } else {
            console.error("Error updating leaderboard:", data.error);
        }
    } catch (error) {
        console.error("Error updating leaderboard:", error);
    }
};

const fetchLeaderboard = async () => {
    try {
        const response = await fetch('http://localhost:3001/leaderboard');
        const data = await response.json();
        if (data.success) {
            setLeaderboard(data.leaderboard);
        }
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
    }
};

const claimNFT = async () => {
    setIsClaiming(true); // แสดง Pop-up

    try {
        const response = await fetch('http://localhost:3001/claimNFT', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: account }),
        });
        const data = await response.json();

        if (data.success) {
            showNotification('NFT claimed successfully!', 'success');
            fetchNFTs(); // อัปเดต NFT ที่แสดงในหน้า
        } else {
            showNotification('Error claiming NFT: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('Error claiming NFT:', error);
        showNotification('Failed to claim NFT. Please try again later.', 'error');
    } finally {
        setIsClaiming(false); // ซ่อน Pop-up
    }
};

useEffect(() => {
    fetchLeaderboard();
}, []);

    // ฟังก์ชันสำหรับดึงจำนวนเหรียญ
    const fetchCoins = async (address) => {
      try {
          const response = await fetch(`http://localhost:3001/coins?address=${address}`);
          const data = await response.json();
          if (data.success) {
              setCoins(data.balance); // อัปเดตสถานะจำนวนเหรียญ
          } else {
              console.error("Error fetching coins:", data.error);
          }
      } catch (error) {
          console.error("Error fetching coins:", error);
      }
  };

  const getCharacterImage = () => {
    if (health <= 10) {
        return "https://i.pinimg.com/originals/11/44/a6/1144a6a428ce7756f1f596d829d24c10.gif"; // ใส่ URL รูปตัวละครสำหรับเลือด 0-10
    } else if (health <= 20) {
        return "https://i.pinimg.com/originals/10/d0/1a/10d01a7b55b7d75fbea163645bed8a2d.gif"; // ใส่ URL รูปตัวละครสำหรับเลือด 11-20
    } else {
        return "https://i.pinimg.com/originals/37/b0/48/37b04822a0289888d4423f6daabe04a6.gif"; // ใส่ URL รูปตัวละครสำหรับเลือด 21-30
    }
};

return (
    <div className="game-container">
        {!account && (
            <div className="connect-container">
                <h1 className="game-title">Clicker Game</h1>
                <button className="connect-button" onClick={connectWallet}>
                    Connect MetaMask
                </button>
            </div>
        )}
        {account && (
            <>
                <div className="coin-wallet">
                    Coins: {coins}
                </div>

                {/* ย้ายส่วนแสดง NFT มาไว้ใต้ Coin Wallet */}
                <div className="nft-container">
                <h3>Your Achievement NFTs:</h3>
                    {nfts.length === 0 ? (
                        <p>No NFTs found.</p>
                        ) : (
                        <div className="nft-list">
                            {nfts.map((nft, index) => (
                                <div key={index} className="nft-item">
                                <img src={nft.image} alt={nft.name} />
                                <p><strong>{nft.name}</strong></p>
                                <p>ID: {nft.tokenId}</p>
                                <p>{nft.description}</p>
                        </div>
                        ))}
                    </div>
                    )}
                </div>

                <h1 className="game-title">Clicker Game</h1>
                <div className="game-info">
                    <p className="account-info">Connected account: {account}</p>
                </div>

                <div className="character-container" onClick={handleClick}>
                    <img
                        className="character-image"
                        src={getCharacterImage()}
                        alt="Character"
                    />
                </div>

                <div className="status-container">
                    <div className="status-bars">
                        <div>
                            <p>Energy: {energy}/{maxEnergy}</p>
                            {renderProgressBar(energy, maxEnergy, 'green')}
                        </div>
                        <div>
                            <p>Health: {health}/{maxHealth}</p>
                            {renderProgressBar(health, maxHealth, 'red')}
                        </div>
                    </div>
                    <p>Clicks: {clicks}</p>
                    <div className="button-group">
                        <button className="game-button claim-button" onClick={() => { 
                            claimTokens(); 
                            updateLeaderboard(); 
                        }} disabled={health > 0}>
                            Claim Tokens
                        </button>
                        <button
                            className="game-button claim-button"
                            onClick={claimNFT}
                            disabled={hasNFT || !leaderboard.some(entry => entry.address === account && entry.clicks >= 100)}
                        >
                            Claim NFT
                        </button>
                    </div>
                </div>

                <div className="leaderboard">
    <h2>Leaderboard</h2>
    <ul>
        {leaderboard.map((entry, index) => (
            <li key={index}>
                {index + 1}. {entry.address.slice(0, 10)}... - {entry.clicks} clicks
            </li>
        ))}
    </ul>
</div>

            </>
        )}

{isClaiming && (
    <div className="popup">
        <div className="popup-content">
            <p>🎮 Processing your transaction...</p>
        </div>
    </div>
)}
    </div>
);




    
};

export default App;
