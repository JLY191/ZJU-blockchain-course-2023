// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// Uncomment the line to use openzeppelin/ERC721
// You can use this dependency directly because it has been installed by TA already

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

// import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
// Uncomment this line to use console.log
import "hardhat/console.sol";
import "./BorrowERC20.sol";

contract BorrowYourCar is ERC721 {

    // use a event if you want
    // to represent time you can choose block.timestamp
    event CarBorrowed(uint256 carTokenId, address borrower, uint256 startTime, uint256 duration);

    // car结构体
    struct Car {
        address owner;
        address borrower;
        uint256 borrowUntil;
    }
    
    // 管理员
    address public manager;
    
    // 车辆数，一开始为0
    uint256 public length = 0;

    // ERC20的instance，否则无法调用ERC20相关函数
    BorrowERC20 public borrowPay;

    // 车
    mapping(uint256 => Car) public cars;

    // 用户车
    mapping(address => uint256[]) public userCars;

    // 构造函数
    constructor() ERC721("BorrowYourCar", "BYC") {
        manager = msg.sender;
        borrowPay = new BorrowERC20("ERC20Token", "Token");
    }

    // 只能manager才能干的
    modifier onlyOwner {
        require(msg.sender == manager, "You are not the manager of the project!");
        _;
    }

    // 生成车
    function mintCar() external {
        uint256 carTokenId = length;
        _mint(msg.sender, carTokenId);
        cars[carTokenId] = Car(msg.sender, address(0), 0);
        userCars[msg.sender].push(carTokenId);
        length = length + 1;
    }

    // 用户车列表
    function getUserCars() public view returns (uint256[] memory) {
        return userCars[msg.sender];
    }

    // 获得某辆车信息
    function getCarInfo(uint256 carTokenId) public view returns (address owner, address borrower, uint256 borrowUntil) {
        Car storage car = cars[carTokenId];
        return (car.owner, car.borrower, car.borrowUntil);
    }

    // 获得空闲车
    function getFreeCar() public view returns (Car[] memory) {
        uint256 freeCnt = 0;
        uint256[] memory freeCarIndexList = new uint256[](length);
        for (uint256 i = 0; i < length; i++) {
            if (cars[i].borrower == address(0) || cars[i].borrowUntil < block.timestamp) {
                freeCarIndexList[freeCnt] = i;
                freeCnt = freeCnt + 1;
            }
        }
        Car[] memory retCars = new Car[](freeCnt);
        for (uint256 i = 0; i < freeCnt; i++) {
            retCars[i] = cars[freeCarIndexList[i]];
        } 
        return retCars;
    }

    // 借车
    function borrowCar(uint256 carTokenId, uint256 duration) payable external {
        
        // 要借的车
        Car storage car = cars[carTokenId];
        
        // 满足条件的车可以借
        require(car.owner != address(0), "Car does not exist");
        require(uint256(car.borrowUntil) < block.timestamp || car.borrower == address(0), "Car is already borrowed");
        car.borrower = msg.sender;
        car.borrowUntil = block.timestamp + duration;
        uint256 thisBorrowPay = duration;

        // token要够
        require(borrowPay.balanceOf(msg.sender) >= thisBorrowPay, "Not enough money!");

        // 借的人向车主付token
        borrowPay.transferFrom(msg.sender, cars[carTokenId].owner, thisBorrowPay);

        // 借车事件记录
        emit CarBorrowed(carTokenId, msg.sender, block.timestamp, duration);
    }

    // 还车，这次没实现（
    function returnCar(uint256 carTokenId) public {
        require(cars[carTokenId].borrower == msg.sender, "You are not the borrower!");
        cars[carTokenId].borrower = address(0);
        cars[carTokenId].borrowUntil = 0;
    }
}