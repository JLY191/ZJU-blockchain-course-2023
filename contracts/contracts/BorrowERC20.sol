// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BorrowERC20 is ERC20 {

    // 构造函数
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {}
    
    // 是否领过token
    mapping(address => bool) ifGivenMoney;

    // 领token
    function initialMoney() public {
        require(ifGivenMoney[msg.sender] == false, "Already given.");
        _mint(msg.sender, 1000000000000000000000000000);
        ifGivenMoney[msg.sender] = true;
    }
}