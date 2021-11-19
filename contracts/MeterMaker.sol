// SPDX-License-Identifier: MIT

// P1 - P3: OK
pragma solidity 0.6.12;
import "./libraries/SafeMath.sol";
import "./libraries/SafeERC20.sol";

import "./uniswapv2/interfaces/IUniswapV2ERC20.sol";
import "./uniswapv2/interfaces/IUniswapV2Pair.sol";
import "./uniswapv2/interfaces/IUniswapV2Factory.sol";

import "./Ownable.sol";

// SushiMaker is MasterChef's left hand and kinda a wizard. He can cook up Sushi from pretty much anything!
// This contract handles "serving up" rewards for xSushi holders by trading tokens collected from fees for Sushi.

// T1 - T4: OK
contract MeterMaker is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // V1 - V5: OK
    IUniswapV2Factory public immutable factory;
    //0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac
    // V1 - V5: OK
    address public immutable vault;
    //???
    // V1 - V5: OK
    address private immutable mtr;
    //???
    // V1 - V5: OK
    address private immutable mtrg;
    //???


    event LogMTRGBought(
        uint256 mtrAmountIn,
        uint256 mtrgAmountOut
    );

    constructor(
        address _factory,
        address _vault,
        address _mtr,
        address _mtrg
    ) public {
        factory = IUniswapV2Factory(_factory);
        vault = _vault;
        mtr = _mtr;
        mtrg = _mtrg;
    }

    // M1 - M5: OK
    // C1 - C24: OK
    // C6: It's not a fool proof solution, but it prevents flash loans, so here it's ok to use tx.origin
    modifier onlyEOA() {
        // Try to make flash-loan exploit harder to do by only allowing externally owned addresses.
        require(msg.sender == tx.origin, "MeterMaker: must use EOA");
        _;
    }

    // F1 - F10: OK
    // F3: _convert is separate to save gas by only checking the 'onlyEOA' modifier once in case of convertMultiple
    // F6: There is an exploit to add lots of SUSHI to the bar, run convert, then remove the SUSHI again.
    //     As the size of the SushiBar has grown, this requires large amounts of funds and isn't super profitable anymore
    //     The onlyEOA modifier prevents this being done with a flash loan.
    // C1 - C24: OK
    function buybackMTRG() external onlyEOA() {
        uint256 mtrAmountIn = IERC20(mtr).balanceOf(address(this));
        if (mtrAmountIn > 0){
            uint256 mtrgAmountOut = _toMTRG(mtr, mtrAmountIn);
            emit LogMTRGBought(mtrAmountIn, mtrgAmountOut);
        }
    }

    // F1 - F10: OK
    // C1 - C24: OK
    // All safeTransfer, swap: X1 - X5: OK
    function _swap(
        address fromToken,
        address toToken,
        uint256 amountIn,
        address to
    ) internal returns (uint256 amountOut) {
        // Checks
        // X1 - X5: OK
        IUniswapV2Pair pair =
            IUniswapV2Pair(factory.getPair(fromToken, toToken));
        require(address(pair) != address(0), "MeterMaker: Cannot convert");

        // Interactions
        // X1 - X5: OK
        (uint256 reserve0, uint256 reserve1, ) = pair.getReserves();
        uint256 amountInWithFee = amountIn.mul(997);
        if (fromToken == pair.token0()) {
            amountOut =
                amountInWithFee.mul(reserve1) /
                reserve0.mul(1000).add(amountInWithFee);
            IERC20(fromToken).safeTransfer(address(pair), amountIn);
            pair.swap(0, amountOut, to, new bytes(0));
            // TODO: Add maximum slippage?
        } else {
            amountOut =
                amountInWithFee.mul(reserve0) /
                reserve1.mul(1000).add(amountInWithFee);
            IERC20(fromToken).safeTransfer(address(pair), amountIn);
            pair.swap(amountOut, 0, to, new bytes(0));
            // TODO: Add maximum slippage?
        }
    }

    // F1 - F10: OK
    // C1 - C24: OK
    function _toMTRG(address token, uint256 amountIn)
        internal
        returns (uint256 amountOut)
    {
        // X1 - X5: OK
        amountOut = _swap(token, mtrg, amountIn, vault);
    }
}
