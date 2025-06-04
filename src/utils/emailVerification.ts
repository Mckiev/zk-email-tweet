// For now, commenting out zk-email imports due to browser compatibility issues
// The package requires Node.js modules that don't work in browsers
// TODO: Move DKIM verification to server-side or use browser-compatible alternative
// import { verifyDKIMSignature, generateEmailVerifierInputs } from '@zk-email/helpers';

export interface DKIMVerificationResult {
  body: Buffer;
  headers: { [key: string]: string };
  publicKey: Buffer;
  signature: Buffer;
  bodyHash: string;
  canonicalizedHeader: Buffer;
  canonicalizedBody: Buffer;
}

export interface EmailVerificationResult {
  success: boolean;
  dkimResult?: DKIMVerificationResult;
  extractedUsername?: string;
  error?: string;
}

// Extract username from Twitter login notification email
export function extractUsernameFromEmail(emailContent: string): string | null {
  // More comprehensive regex to handle Twitter login notifications
  const patterns = [
    /We noticed a login to your account @(\w+) from a new device/i,
    /Login attempt for @(\w+)/i,
    /Sign-in notification for @(\w+)/i,
    /New sign-in for your account @(\w+)/i
  ];
  
  for (const pattern of patterns) {
    const match = emailContent.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

// Check if email is from Twitter/X.com domain
export function isFromTwitterDomain(headers: { [key: string]: string }): boolean {
  const fromHeader = headers['from']?.toLowerCase() || '';
  const returnPathHeader = headers['return-path']?.toLowerCase() || '';
  
  return fromHeader.includes('twitter.com') || 
         fromHeader.includes('x.com') ||
         returnPathHeader.includes('twitter.com') ||
         returnPathHeader.includes('x.com');
}

// Parse .eml file and perform basic verification (DKIM verification moved to future server-side implementation)
export async function verifyTwitterEmailAuthenticity(emailContent: string): Promise<EmailVerificationResult> {
  try {
    // Parse email headers first to check domain
    let headerEndIndex = emailContent.indexOf('\r\n\r\n');
    if (headerEndIndex === -1) {
      // Try with just \n\n as separator
      headerEndIndex = emailContent.indexOf('\n\n');
      if (headerEndIndex === -1) {
        return {
          success: false,
          error: "Invalid email format: No header/body separator found"
        };
      }
    }
    
    // Parse headers manually
    const headerSection = emailContent.substring(0, headerEndIndex);
    const headers: { [key: string]: string } = {};
    const headerLines = headerSection.split(/\r?\n/);
    
    for (const line of headerLines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim().toLowerCase();
        const value = line.substring(colonIndex + 1).trim();
        headers[key] = value;
      }
    }
    
    // Check if email is from Twitter
    if (!isFromTwitterDomain(headers)) {
      return {
        success: false,
        error: "Email is not from Twitter/X.com domain"
      };
    }
    
    // For now, skip DKIM verification due to browser compatibility issues
    // Extract body content
    const bodyContent = emailContent.substring(headerEndIndex + 4);
    const extractedUsername = extractUsernameFromEmail(bodyContent);
    
    if (!extractedUsername) {
      return {
        success: false,
        error: "No Twitter username found in email content"
      };
    }
    
    // Check for presence of DKIM signature
    const hasDKIMSignature = 'dkim-signature' in headers;
    
    return {
      success: true,
      extractedUsername,
      error: hasDKIMSignature 
        ? "Email has DKIM signature but verification skipped (browser limitation)"
        : "No DKIM signature found - email authenticity not verified"
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Email verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Generate circuit inputs for email verification (placeholder for future implementation)
export async function generateEmailCircuitInputs(
  _dkimResult: DKIMVerificationResult,
  maxHeadersLength: number = 1024,
  maxBodyLength: number = 2048
): Promise<any> {
  // TODO: Implement proper circuit input generation when DKIM verification is working
  // For now, return placeholder inputs
  console.warn("Circuit input generation not implemented - using placeholder");
  return {
    emailHeader: new Array(maxHeadersLength).fill(0),
    emailHeaderLength: 0,
    emailBody: new Array(maxBodyLength).fill(0),
    emailBodyLength: 0,
    rsaSignature: new Array(256).fill(0),
    rsaPublicKey: new Array(256).fill(0)
  };
}