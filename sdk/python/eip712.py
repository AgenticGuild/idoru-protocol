from eth_abi import encode
from eth_hash.auto import keccak


def compute_pid(verifying_contract: str, chain_id: int, payer: str, payee: str, token: str, amount: int, nonce: int, expiry: int) -> str:
    packed = encode([
        'address', 'uint256', 'address', 'address', 'address', 'uint256', 'uint256', 'uint256'
    ], [verifying_contract, chain_id, payer, payee, token, amount, nonce, expiry])
    return '0x' + keccak(packed).hex()
