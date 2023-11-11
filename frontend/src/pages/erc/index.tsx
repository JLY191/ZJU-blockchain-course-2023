import {Button, Image} from 'antd';
import {Header} from "../../asset";
import {useEffect, useState} from 'react';
import {BorrowYourCarContract, ERC20Contract, web3} from "../../utils/contracts";
import './index.css';

const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)
// TODO change according to your configuration
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'

class Car {

    // 构造函数，用来接收sol返回的Car类型变量
    constructor(public _owner: string, public _borrower: string, public _borrowUntil: string) {
        this.owner = _owner;
        this.borrower = _borrower;
        this.borrowUntil = _borrowUntil;
    }
    public owner: string;
    public borrower: string;
    public borrowUntil: string;
}



const CarPage = () => {

    // 账户和ERC20代币余额
    const [account, setAccount] = useState('')
    const [accountBalance, setAccountBalance] = useState(0)

    // 是否展示用户车和空闲车
    const [isShow, setIsShow] = useState(false)
    const [isShowList, setIsShowList] = useState(false)

    // 管理员
    const [managerAccount, setManagerAccount] = useState('')

    // 所有车、用户拥有车、空闲车
    const [cars, setCars] = useState<Car[]>([])
    const [userCars, setUserCars] = useState<Car[]>([])
    const [freeCars, setFreeCars] = useState<Car[]>([])

    // 输入值，用来查具体哪辆车
    const [inputValue, setInputValue] = useState(0)

    // 调用borrowCar()的参数
    const [token, setToken] = useState(0);
    const [borrowTime, setBorrowTime] = useState(0);

    useEffect(() => {
        // 初始化检查用户是否已经连接钱包
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        const initCheckAccounts = async () => {
            // @ts-ignore
            const {ethereum} = window;
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                // 尝试获取连接的用户账户
                const accounts = await web3.eth.getAccounts()
                if(accounts && accounts.length) {
                    setAccount(accounts[0])
                }
            }
        }

        initCheckAccounts()
    }, [])

    useEffect(() => {
        const getCarContractInfo = async () => {
            if (BorrowYourCarContract) {

                // manager
                const ma = await BorrowYourCarContract.methods.manager().call()
                setManagerAccount(ma)

                // 区块链里车辆数
                const ln = await BorrowYourCarContract.methods.length().call()
                
                // 三种车
                var tmpCars: Car[]
                tmpCars = []
                var userCars: Car[]
                userCars = []
                var tmpFreeCars: Car[] = []

                // 循环读每一辆
                for (let i = 0; i < ln; i++) {

                    // 读车
                    let cs = await BorrowYourCarContract.methods.cars(i).call()
                    
                    // cars
                    tmpCars.push(cs)

                    // userCars
                    if (cs.owner === account) {
                        userCars.push(cs)
                    }

                    // freeCars
                    if (cs.borrower == 0 || cs.borrowUtil < (new Date()).valueOf()) {
                        tmpFreeCars.push(cs)
                    }
                }

                // use state
                setCars(tmpCars)
                setUserCars(userCars)
                setFreeCars(tmpFreeCars)
            } else {
                alert('Contract not exists.')
            }
        }

        getCarContractInfo()
    }, [cars])  // cars变就刷新

    useEffect(() => {
        const getAccountInfo = async () => {

            // ERC20 token
            if (BorrowYourCarContract && ERC20Contract) {
                const ab = await ERC20Contract.methods.balanceOf(account).call()
                setAccountBalance(ab)
            } else {
                alert('Contract not exists.')
            }
        }

        if(account !== '') {
            getAccountInfo()
        }
    }, [account])  // account变就刷新

    // 给展示的车对应图片，模6
    function getImageURL(token: number) {
        let a: number = token % 6 + 1;
        let r: string = require('./images/' + String(a) + '.jpeg');
        return r;
    }

    // 发ERC20 token
    const onClaimInitialMoney = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (ERC20Contract) {
            try {
                await ERC20Contract.methods.initialMoney().send({
                    from: account
                })
                alert('You have claimed ERC20 Token.')
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }

    // 下面两个决定是否展示
    const onClickIsShow = async () => {
        if (account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        setIsShow(!isShow);
    }
    const onClickIsShowList = async () => {
        if (account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        setIsShowList(!isShowList);
    }

    // 领车
    const onClickGetCar = async () => {
        if (account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (BorrowYourCarContract && ERC20Contract) {
            try {
                await BorrowYourCarContract.methods.mintCar().send({
                    from: account
                })
                alert('You have requested a car!')
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }

    // 借车
    const onBorrowCar = async () => {
        if (account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (BorrowYourCarContract && ERC20Contract) {
            try {
                
                // approve填ERC721部署的地址
                await ERC20Contract.methods.approve("0xCBFfCDEe5986e4C77e0c8d492E8b1be5bb942451", 100000).send({
                    from: account
                })
                
                // 借车
                await BorrowYourCarContract.methods.borrowCar(token, borrowTime).send({
                    from: account,
                    gasLimit: 6721975
                })
                alert('You borrow the car now.')
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }

    // 连接钱包
    const onClickConnectWallet = async () => {
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        // @ts-ignore
        const {ethereum} = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            alert('MetaMask is not installed!');
            return
        }

        try {
            // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId, // Chain-ID
                    chainName: GanacheTestChainName, // Chain-Name
                    rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
                };

                try {
                    // 尝试切换到本地网络
                    await ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chain.chainId}]})
                } catch (switchError: any) {
                    // 如果本地网络没有添加到Metamask中，添加该网络
                    if (switchError.code === 4902) {
                        await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain]
                        });
                    }
                }
            }

            // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
            await ethereum.request({method: 'eth_requestAccounts'});
            // 获取小狐狸拿到的授权用户列表
            const accounts = await ethereum.request({method: 'eth_accounts'});
            // 如果用户存在，展示其account，否则显示错误信息
            setAccount(accounts[0] || 'Not able to get accounts');
        } catch (error: any) {
            alert(error.message)
        }
    }

    

    return (
        <div className='container'>
            <Image
                width='100%'
                height='150px'
                preview={false}
                src={Header}
            />
            <div className='main'>
                <h1>2023区块链HW2</h1>
                <Button onClick={onClaimInitialMoney}>爆金币啦！快来领取ERC20积分，每个用户最多能领取一次！</Button>
                <br />
                <div>管理员地址：{managerAccount}</div>
                <div className='account'>
                    {account === '' && <Button onClick={onClickConnectWallet}>连接钱包</Button>}
                    <div>当前用户：{account === '' ? '无用户连接' : account}</div>
                    <div>当前用户拥有ERC20积分数量：{account === '' ? 0 : accountBalance}</div>
                </div>
                <br />
                <div>您拥有的车列表：</div>
                <div>{(userCars.length !== 0 && isShowList === true) ? userCars.map((userCar) => <li>token = {cars.indexOf(userCar)}<br />borrower = {userCar.borrower}<br />borrowUntil = {userCar.borrowUntil}<br /><img src={getImageURL(cars.indexOf(userCar))}></img></li>) : <div>no info</div>}</div>
                <div>{}</div>
                <br />
                <div>空闲车列表：</div>
                <div>{(freeCars.length !== 0 && isShow === true) ? freeCars.map((freeCar) => <li>token = {cars.indexOf(freeCar)}<br />owner = {freeCar.owner}<br />borrower = {freeCar.borrower}<br />borrowUntil = {freeCar.borrowUntil}<br /><img src={getImageURL(cars.indexOf(freeCar))}></img></li>) : <div>no info</div>}</div>
                <br />
                <div>
                    <div>查询车辆信息，请输入车对应token：</div>
                    <form>
                        Token：<input type="text" name="token" placeholder={String(0)} onChange={e => setInputValue(Number(e.target.value))} />
                        <br />
                    </form>
                    <div>{inputValue < cars.length ? <li>token = {inputValue}<br />owner = {cars[inputValue].owner}<br />borrower = {cars[inputValue].borrower}<br />borrowUntil = {cars[inputValue].borrowUntil}<br /><img src={getImageURL(inputValue)}></img></li> : <div>invalid car token!</div>}</div>
                </div>
                <br />
                <div>
                    <div>输入借车的token和时间：</div><br />
                <form>
        <label>
          Token:
          <input
            type="number"
            value={token}
            onChange={(e) => setToken(Number(e.target.value))}
            required
          />
        </label>
        <label>
          Borrow Time:
          <input
            type="number"
            value={borrowTime}
            onChange={(e) => setBorrowTime(Number(e.target.value))}
            required
          />
        </label>
        <button type="button" onClick={onBorrowCar}>提交</button>
      </form>
                </div>
                <div className='operation'>
                    <div style={{marginBottom: '20px'}}>操作栏</div>
                    <div className='buttons'>
                        <Button style={{width: '200px'}} onClick={onClickGetCar}>领取一辆你的车</Button> 
                        <Button style={{width: '200px'}} onClick={onClickIsShowList}>{isShowList ? <div>收起您的车列表</div> : <div>展开您的车列表</div>}</Button>
                        <Button style={{width: '200px'}} onClick={onClickIsShow}>{isShow ? <div>收起空闲车列表</div> : <div>展开空闲车列表</div>}</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CarPage