// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Feedback {
    address public owner;

    struct FeedbackRecord {
        bytes32 feedbackHash;
        uint256 timestamp;
        address submittedBy;
    }

    FeedbackRecord[] public records;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function storeFeedbackHash(bytes32 _hash) external onlyOwner {
        records.push(FeedbackRecord(_hash, block.timestamp, msg.sender));
    }

    function getCount() external view returns (uint256) {
        return records.length;
    }

    function getRecord(uint256 index) external view returns (bytes32, uint256, address) {
        FeedbackRecord storage r = records[index];
        return (r.feedbackHash, r.timestamp, r.submittedBy);
    }
}