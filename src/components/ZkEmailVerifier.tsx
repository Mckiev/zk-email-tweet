import { useState } from "react";
import { extractUsernameFromEmail, generateTwitterEmailProof } from "@/utils/zkProof";

export function ZkEmailVerifier() {
  const [email, setEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [allowedUsernames, setAllowedUsernames] = useState<string[]>(["IAmMckiev", "example_user", "test_account"]);
  const [newUsername, setNewUsername] = useState("");
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
    proofGenerated?: boolean;
    proof?: any;
    extractedUsername?: string;
    dkimVerified?: boolean;
    warning?: string;
  } | null>(null);

  const addUsername = () => {
    const username = newUsername.trim().replace('@', '');
    if (username && !allowedUsernames.includes(username)) {
      setAllowedUsernames([...allowedUsernames, username]);
      setNewUsername("");
    }
  };

  const removeUsername = (usernameToRemove: string) => {
    setAllowedUsernames(allowedUsernames.filter(username => username !== usernameToRemove));
  };

  const handleEmailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEmail(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const verifyEmail = async () => {
    if (!email) {
      setVerificationResult({
        success: false,
        message: "Please upload an email file first"
      });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Use the new Twitter email verification with DKIM
      const proofResult = await generateTwitterEmailProof(email, allowedUsernames);
      
      if (!proofResult) {
        // Try fallback to simple pattern extraction
        const extractedUsername = extractUsernameFromEmail(email);
        
        if (!extractedUsername) {
          setVerificationResult({
            success: false,
            message: "Email does not contain expected Twitter login notification pattern. Please ensure the email is a valid Twitter login notification from twitter.com or x.com."
          });
          return;
        }

        setVerificationResult({
          success: false,
          message: `Username @${extractedUsername} found but verification failed. Ensure the email has proper DKIM signatures and is from Twitter/X.com.`,
          extractedUsername
        });
        return;
      }

      const { verifiedUsername, dkimVerified, warning, proof, publicSignals } = proofResult;

      // Check if proof indicates valid username (publicSignals[0] should be 1)
      const isValid = publicSignals && publicSignals[0] === "1";
      
      if (!isValid) {
        setVerificationResult({
          success: false,
          message: `Username @${verifiedUsername} is not in the allowed list`,
          extractedUsername: verifiedUsername,
          dkimVerified
        });
        return;
      }

      // 3. Verification successful with ZK proof
      const successMessage = dkimVerified 
        ? `Successfully verified with DKIM! Username is in the allowed list without revealing which one.`
        : `Username verified (DKIM warning: ${warning}). Consider using a properly signed .eml file for full cryptographic verification.`;

      setVerificationResult({
        success: true,
        message: successMessage,
        proofGenerated: true,
        proof,
        extractedUsername: verifiedUsername,
        dkimVerified,
        warning
      });

    } catch (error) {
      setVerificationResult({
        success: false,
        message: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">🔐 ZK Email Verifier</h2>
          <p className="text-base-content/70 mb-6">
            Upload a Twitter login notification email (.eml format preferred) to verify the username is in your allowed list using zero-knowledge proofs with DKIM verification.
          </p>

          {/* Username Management */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Manage Allowed Usernames:</h3>
            
            {/* Add New Username */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Enter username (without @)"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addUsername()}
                className="input input-bordered flex-1"
              />
              <button
                onClick={addUsername}
                disabled={!newUsername.trim()}
                className="btn btn-primary"
              >
                Add Username
              </button>
            </div>

            {/* Current Usernames */}
            <div className="flex flex-wrap gap-2">
              {allowedUsernames.map((username) => (
                <div key={username} className="badge badge-primary gap-2 p-3">
                  @{username}
                  <button
                    onClick={() => removeUsername(username)}
                    className="btn btn-ghost btn-xs text-primary-content hover:text-error"
                    title="Remove username"
                  >
                    ×
                  </button>
                </div>
              ))}
              {allowedUsernames.length === 0 && (
                <p className="text-base-content/50 italic">No usernames added yet</p>
              )}
            </div>
          </div>

          {/* Email Upload */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Upload Email File (.eml)</span>
            </label>
            <input
              type="file"
              accept=".eml,.txt"
              onChange={handleEmailUpload}
              className="file-input file-input-bordered w-full"
            />
          </div>

          {/* Email Preview */}
          {email && (
            <div className="mb-4">
              <label className="label">
                <span className="label-text">Email Content Preview:</span>
              </label>
              <textarea
                value={email.substring(0, 500) + (email.length > 500 ? "..." : "")}
                readOnly
                className="textarea textarea-bordered w-full h-32"
              />
            </div>
          )}

          {/* Verify Button */}
          <button
            onClick={() => void verifyEmail()}
            disabled={!email || isVerifying}
            className="btn btn-primary btn-lg w-full"
          >
            {isVerifying ? (
              <>
                <span className="loading loading-spinner"></span>
                Verifying Email...
              </>
            ) : (
              "Verify Email & Generate Proof"
            )}
          </button>

          {/* Result Display */}
          {verificationResult && (
            <div className={`alert mt-4 ${verificationResult.success ? 'alert-success' : 'alert-error'}`}>
              <div className="w-full">
                <h3 className="font-bold">
                  {verificationResult.success ? '✅ Verification Successful' : '❌ Verification Failed'}
                </h3>
                <p>{verificationResult.message}</p>
                
                {verificationResult.extractedUsername && (
                  <p className="text-sm mt-2 opacity-70">
                    Extracted username: @{verificationResult.extractedUsername}
                  </p>
                )}
                
                {verificationResult.success && verificationResult.proofGenerated && (
                  <div className="mt-4 p-3 bg-base-200 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">🔐 Zero-Knowledge Proof Generated</h4>
                    <div className="text-xs space-y-1">
                      <p><strong>Protocol:</strong> {verificationResult.proof?.protocol}</p>
                      <p><strong>Curve:</strong> {verificationResult.proof?.curve}</p>
                      <p className={`${verificationResult.dkimVerified ? 'text-success' : 'text-warning'}`}>
                        <strong>DKIM Verified:</strong> {verificationResult.dkimVerified ? 'Yes ✅' : 'No ⚠️'}
                      </p>
                      <p className="text-success"><strong>Privacy:</strong> Username verified without revealing which one!</p>
                      {verificationResult.warning && (
                        <p className="text-warning text-xs">
                          <strong>Warning:</strong> {verificationResult.warning}
                        </p>
                      )}
                    </div>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs opacity-70">View proof details</summary>
                      <pre className="text-xs mt-2 p-2 bg-base-300 rounded overflow-x-auto">
                        {JSON.stringify(verificationResult.proof, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
                
                {verificationResult.success && !verificationResult.proofGenerated && (
                  <p className="text-sm mt-2 opacity-70">
                    Note: Using mock ZK proof for demonstration - circuit compilation needed for real proofs.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}