// @ts-ignore
import * as snarkjs from "snarkjs";

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

// Extract username from Twitter login notification email
export function extractUsernameFromEmail(emailContent: string): string | null {
  const pattern = /We noticed a login to your account @(\w+) from a new device/;
  const match = emailContent.match(pattern);
  return match ? match[1] : null;
}

// Generate real ZK proof for username verification
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
    
    console.log("Generating real ZK proof with input:", input);
    
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