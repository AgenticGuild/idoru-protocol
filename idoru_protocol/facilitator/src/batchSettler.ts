import { ethers } from "ethers";

const GATEWAY_ABI = [
  "function domainSeparator() view returns (bytes32)",
  "function quote((address payer,address payee,address token,uint256 amount,uint256 fee,uint256 expiry,bytes32 pid),bytes facilitatorSig)",
  "function pay(bytes32 pid)",
  "function payments(bytes32 pid) view returns (address,address,address,uint256,uint256,uint256,bool,bool)"
];

export function gatewayContract(address: string, signer: ethers.Signer) {
  return new ethers.Contract(address, GATEWAY_ABI, signer);
}


