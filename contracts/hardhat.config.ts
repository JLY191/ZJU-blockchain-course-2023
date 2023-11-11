import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://localhost:8545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '0xbff0e430c83084fd166fbaaa24a0fb774b730e5c2b8aeae17b0b5481a5849f24',
        '0x9593d0ac1a86fff784ee2d8e7d80cfefd955a571bb491eb7b19df86074164401',
        '0x2cff6f74aff67a5688001789cfacdeb99b03b9a84255ce584e3a2a425faf9b9f'
      ]
    },
  },
};

export default config;
