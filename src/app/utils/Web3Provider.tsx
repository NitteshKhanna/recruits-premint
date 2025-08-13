"use client";

import { WagmiProvider, createConfig } from "wagmi";
import { mainnet, sepolia, abstract } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";


const chain = (process.env.NEXT_PUBLIC_CHAIN == "abstract") ? abstract : sepolia;

const config = createConfig(
  getDefaultConfig({
    chains: [chain], // Add more chains if needed
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    appName: "Recruits",
    appDescription: "Your app description",
    appUrl: "https://your-app-url.com",
    appIcon: "https://your-app-url.com/icon.png",
    // autoconn
  })
);

const disconnect = () => {
  localStorage.removeItem("loginData")
}
// ethers.providers.Web3Provider(
//   ethereum,
//   {
//     name: 'sepolia',
//     chainId: 11155111,
//     ensAddress: null // Disable ENS
//   }
// );

const queryClient = new QueryClient();

export default function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
      <ConnectKitProvider theme="midnight"
          options={{
            enforceSupportedChains: true,
            initialChainId: chain.id,
            hideTooltips: false
          }}
          onDisconnect = {disconnect}
        >{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}