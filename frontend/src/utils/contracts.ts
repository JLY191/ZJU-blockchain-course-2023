import Addresses from './contract-addresses.json'
import BorrowYourCar from './abis/BorrowYourCar.json'
import BorrowERC20 from './abis/BorrowERC20.json'

const Web3 = require('web3');

// @ts-ignore
// 创建web3实例
// 可以阅读获取更多信息https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3
let web3 = new Web3(window.web3.currentProvider)

// 修改地址为部署的合约地址
const BYCAddress = Addresses.BYC
const BYCABI = BorrowYourCar.abi
const ERC20Address = Addresses.ERC20
const ERC20ABI = BorrowERC20.abi

// 获取合约实例
const BorrowYourCarContract = new web3.eth.Contract(BYCABI, BYCAddress);
const ERC20Contract = new web3.eth.Contract(ERC20ABI, ERC20Address);

// 导出web3实例和其它部署的合约
export {BorrowYourCarContract, ERC20Contract, web3}