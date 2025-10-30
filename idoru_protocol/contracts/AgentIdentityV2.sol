// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title IERC5192 (Minimal)
/// @notice EIP-5192 interface for soulbound tokens.
interface IERC5192 {
    event Locked(uint256 tokenId);
    event Unlocked(uint256 tokenId);
    function locked(uint256 tokenId) external view returns (bool);
}

/// @title AgentIdentityV2
/// @notice Soulbound agent identity with optional ERC-4337 account binding and KYC attestation storage.
/// @custom:version v2.0
contract AgentIdentityV2 is ERC721URIStorage, Ownable, IERC5192 {
    error NotTokenOwner();
    error NonTransferable();

    struct AgentMeta {
        address account4337;
        bytes32 kycAttestation;
        bool isLocked;
    }

    uint256 public nextId;
    mapping(uint256 => AgentMeta) private idToMeta;

    event AgentRegistered(uint256 indexed id, address indexed owner, bytes32 kycAttestation);
    event AccountBound(uint256 indexed id, address indexed account4337);

    constructor(address initialOwner) ERC721("IdoruAgent", "IDAGENT") Ownable(initialOwner) {}

    function register(address to, string memory tokenURI_, bytes32 kycAttestation_) external onlyOwner returns (uint256 id) {
        id = ++nextId;
        _safeMint(to, id);
        _setTokenURI(id, tokenURI_);
        idToMeta[id].kycAttestation = kycAttestation_;
        idToMeta[id].isLocked = true;
        emit AgentRegistered(id, to, kycAttestation_);
        emit Locked(id);
    }

    function bindAccount(uint256 id, address account4337Account) external {
        if (ownerOf(id) != msg.sender) revert NotTokenOwner();
        idToMeta[id].account4337 = account4337Account;
        emit AccountBound(id, account4337Account);
    }

    function kycAttestation(uint256 id) external view returns (bytes32) {
        return idToMeta[id].kycAttestation;
    }

    function account4337(uint256 id) external view returns (address) {
        return idToMeta[id].account4337;
    }

    function locked(uint256 tokenId) public view override returns (bool) {
        return idToMeta[tokenId].isLocked;
    }

    // Non-transferability enforced via hooks
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0)) {
            revert NonTransferable();
        }
        return super._update(to, tokenId, auth);
    }
}


