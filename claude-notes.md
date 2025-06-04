# Claude Notes

## Current Feature: ZK-Email Twitter Login Verification Tool

Building a tool that uses zk-email to verify Twitter login notification emails with ZK proofs.

## Session Information
- Start commit: b3cd10c
- Current commits: (none yet)

## Project Requirements
- Verify emails from x.com/twitter.com with login notification pattern
- Extract username from "We noticed a login to your account @username from a new device. Was this you?"
- Prove username exists in predefined allowlist without revealing which one
- Generate ZK proofs of email authenticity and username validation
- No NFT minting (unlike proof-of-twitter reference project)

## Technical Approach
- Use zk-email library for email verification
- Create custom Circom circuits for pattern matching
- Implement allowlist verification in ZK circuit
- Build web interface for email upload and proof generation

## Progress
- ✅ Analyzed proof-of-twitter reference project
- ✅ Defined project requirements and differences
- ✅ Researched and installed zk-email dependencies (@zk-email/helpers, @zk-email/circuits, snarkjs)
- ✅ Built functional web interface with file upload and pattern matching
- ✅ Implemented regex pattern matching for Twitter login notifications
- ✅ Added username allowlist validation logic
- ✅ Successfully tested with sample email - verification working!

## Current Status
- Basic pattern matching and allowlist validation: WORKING ✅
- Next step: Implement actual ZK proof generation using Circom circuits
- Need to create circuit for email verification and allowlist proof

## Commits Made
- (ready to commit initial foundation)