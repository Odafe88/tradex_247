import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Copy, Check, Loader2 } from "lucide-react";
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';
import { BrowserProvider, parseEther } from 'ethers';

// WalletConnect project ID - Get yours at https://cloud.walletconnect.com
const projectId = '2716cddbc256234b38ae257dc6a65dad';

// Define chains
const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com'
};

const sepolia = {
  chainId: 11155111,
  name: 'Sepolia',
  currency: 'ETH',
  explorerUrl: 'https://sepolia.etherscan.io',
  rpcUrl: 'https://rpc.sepolia.org'
};

// Create metadata
const metadata = {
  name: 'Trading Platform',
  description: 'AI-Powered Trading Platform',
  url: window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

// Create ethers config
const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true,
  rpcUrl: mainnet.rpcUrl,
  defaultChainId: 1
});

// Create Web3Modal
createWeb3Modal({
  ethersConfig,
  chains: [mainnet, sepolia],
  projectId,
  enableAnalytics: true
});

interface WalletConnectDepositProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDepositComplete: (amount: number) => void;
}

export function WalletConnectDeposit({ open, onOpenChange, onDepositComplete }: WalletConnectDepositProps) {
  const { toast } = useToast();
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [depositAmount, setDepositAmount] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Platform wallet address
  const platformWalletAddress = "0xF644DECDd09eE9afd246e1E397016bAa42bEb122";

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // Open WalletConnect modal
      const modal = document.querySelector('w3m-modal') as any;
      if (modal) {
        await modal.open();
      }
      
      // Check if wallet is connected
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum as any);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          setWalletAddress(accounts[0].address);
          toast({
            title: "Wallet Connected",
            description: `Connected to ${accounts[0].address.slice(0, 6)}...${accounts[0].address.slice(-4)}`,
          });
        }
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDeposit = async () => {
    if (!walletAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const provider = new BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      
      // Send transaction
      const tx = await signer.sendTransaction({
        to: platformWalletAddress,
        value: parseEther(depositAmount),
      });

      toast({
        title: "Transaction Sent",
        description: "Waiting for confirmation...",
      });

      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt?.status === 1) {
        // Convert ETH to USD (simplified - in production, use real price feed)
        const usdAmount = amount * 2000; // Assuming 1 ETH = $2000
        
        onDepositComplete(usdAmount);
        toast({
          title: "Deposit Successful",
          description: `Deposited ${amount} ETH (~$${usdAmount.toFixed(2)})`,
        });
        onOpenChange(false);
        setDepositAmount("");
      }
    } catch (error: any) {
      console.error("Deposit error:", error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to process deposit",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(platformWalletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Address Copied",
      description: "Platform wallet address copied to clipboard",
    });
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const ethereum = window.ethereum as any;
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress("");
        }
      };

      ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deposit with Crypto</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Wallet Connection */}
          <div className="space-y-2">
            <Label>Wallet Status</Label>
            {walletAddress ? (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
            ) : (
              <Button 
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full gap-2"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    Connect Wallet
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Platform Wallet Address */}
          <div className="space-y-2">
            <Label>Send To (Platform Wallet)</Label>
            <div className="flex items-center gap-2">
              <Input 
                value={platformWalletAddress}
                readOnly
                className="font-mono text-xs"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={copyAddress}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Send ETH to this address or use the form below
            </p>
          </div>

          {/* Deposit Amount */}
          <div className="space-y-2">
            <Label>Amount (ETH)</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              min="0"
              step="0.001"
              disabled={!walletAddress}
            />
            <p className="text-xs text-muted-foreground">
              Minimum: 0.001 ETH
            </p>
          </div>

          {/* Deposit Button */}
          <Button
            onClick={handleDeposit}
            disabled={!walletAddress || isProcessing || !depositAmount}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              "Deposit ETH"
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Network: Ethereum Mainnet & Sepolia Testnet
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
