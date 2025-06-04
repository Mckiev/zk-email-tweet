// @ts-expect-error snarkjs types not fully available
import * as snarkjs from "snarkjs";
import { verifyTwitterEmailAuthenticity } from './emailVerification';

// Simple hash function to match our circuit (no modulo for circuit compatibility)
export function hashUsername(username: string, salt: number): number {
  let hash = 0;
  const usernameBytes = new TextEncoder().encode(username);
  
  for (let i = 0; i < Math.min(usernameBytes.length, 10); i++) {
    hash += usernameBytes[i] * (i + 1);
  }
  
  return hash + salt; // No modulo to match circuit
}

// Convert string to array of character codes (padded to maxLength)
export function stringToCharArray(str: string, maxLength: number): number[] {
  const result = new Array(maxLength).fill(0);
  const bytes = new TextEncoder().encode(str);
  
  for (let i = 0; i < Math.min(bytes.length, maxLength); i++) {
    result[i] = bytes[i];
  }
  
  return result;
}

// Extract username from Twitter login notification email (re-export from emailVerification)
export { extractUsernameFromEmail } from './emailVerification';

// Generate ZK proof with email verification for Twitter login notifications
export async function generateTwitterEmailProof(
  emailContent: string,
  allowedUsernames: string[]
): Promise<{
  proof: any;
  publicSignals: any;
  verifiedUsername?: string;
  dkimVerified: boolean;
  warning?: string;
} | null> {
  try {
    console.log("Starting Twitter email verification...");
    
    // 1. Verify email authenticity with DKIM
    const emailVerification = await verifyTwitterEmailAuthenticity(emailContent);
    
    if (!emailVerification.success) {
      console.error("Email verification failed:", emailVerification.error);
      return null;
    }
    
    const { extractedUsername, dkimResult, error } = emailVerification;
    
    if (!extractedUsername) {
      console.error("No username extracted from email");
      return null;
    }
    
    console.log("Extracted username:", extractedUsername);
    console.log("DKIM verified:", !!dkimResult);
    
    // 2. Check if username is in allowed list
    if (!allowedUsernames.includes(extractedUsername)) {
      console.error(`Username @${extractedUsername} not in allowed list:`, allowedUsernames);
      return null;
    }
    
    // 3. For now, use the simple proof system until we have the full email circuit
    // In a full implementation, this would use the DKIM verification in the circuit
    const simpleProof = await generateUsernameProof(extractedUsername, allowedUsernames);
    
    if (!simpleProof) {
      console.error("Failed to generate proof");
      return null;
    }
    
    return {
      ...simpleProof,
      verifiedUsername: extractedUsername,
      dkimVerified: !!dkimResult,
      warning: error // Include any DKIM warnings
    };
    
  } catch (error) {
    console.error("Error generating Twitter email proof:", error);
    return null;
  }
}

// Generate simple username proof (legacy function for compatibility)
export async function generateUsernameProof(
  username: string,
  allowedUsernames: string[]
): Promise<{
  proof: any;
  publicSignals: any;
} | null> {
  try {
    // Generate random salt
    const salt = Math.floor(Math.random() * 1000000);
    
    // Hash all allowed usernames with the same salt (max 3 for our circuit)
    const allowedHashes = allowedUsernames.slice(0, 3).map(user => hashUsername(user, salt));
    
    // Pad to exactly 3 elements
    while (allowedHashes.length < 3) {
      allowedHashes.push(0);
    }
    
    // Prepare circuit inputs
    const input = {
      allowedHashes: allowedHashes.map(h => h.toString()),
      username: stringToCharArray(username, 10).map(n => n.toString()),
      usernameLength: username.length.toString(),
      salt: salt.toString()
    };
    
    console.log("Generating simple ZK proof with input:", input);
    
    // Use the compiled circuit files
    const wasmPath = "/circuits/twitter-login_js/twitter-login.wasm";
    const zkeyPath = "/circuits/twitter-login_0001.zkey";
    
    // Generate the proof
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      wasmPath,
      zkeyPath
    );
    
    return { proof, publicSignals };
    
  } catch (error) {
    console.error("Error generating ZK proof:", error);
    return null;
  }
}

// Verify a ZK proof
export async function verifyProof(
  proof: any,
  publicSignals: any,
  verificationKeyPath: string
): Promise<boolean> {
  try {
    const vKey = await fetch(verificationKeyPath).then(res => res.json());
    const result = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    return result;
  } catch (error) {
    console.error("Error verifying proof:", error);
    return false;
  }
}

// Mock function for development (when circuit files aren't ready)
export async function mockGenerateProof(
  username: string,
  allowedUsernames: string[]
): Promise<{
  proof: any;
  publicSignals: any;
  isValid: boolean;
}> {
  // Simulate proof generation delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const isValid = allowedUsernames.includes(username);
  
  return {
    proof: {
      pi_a: ["0x1234", "0x5678", "0x1"],
      pi_b: [["0xabcd", "0xefgh"], ["0x9999", "0x8888"], ["0x1", "0x0"]],
      pi_c: ["0x4444", "0x5555", "0x1"],
      protocol: "groth16",
      curve: "bn128"
    },
    publicSignals: [isValid ? "1" : "0"],
    isValid
  };
}