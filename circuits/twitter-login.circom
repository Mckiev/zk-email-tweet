pragma circom 2.1.5;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/gates.circom";

// Simple circuit to prove username is in allowlist (3 users max for testing)
template SimpleUsernameVerifier() {
    // Public inputs
    signal input allowedHashes[3]; // Hashes of 3 allowed usernames
    
    // Private inputs  
    signal input username[10]; // Username as array of chars (max 10 chars)
    signal input usernameLength; // Actual length
    signal input salt; // Salt for hashing
    
    // Output
    signal output isValid;
    
    // 1. Compute simple hash of the username (without modulo)
    signal hash;
    signal hashTerms[10];
    
    // Simple hash: sum of char codes with position weighting + salt
    for (var i = 0; i < 10; i++) {
        hashTerms[i] <-- (i < usernameLength) ? username[i] * (i + 1) : 0;
    }
    
    signal sum1 <== hashTerms[0] + hashTerms[1];
    signal sum2 <== sum1 + hashTerms[2];
    signal sum3 <== sum2 + hashTerms[3];
    signal sum4 <== sum3 + hashTerms[4];
    signal sum5 <== sum4 + hashTerms[5];
    signal sum6 <== sum5 + hashTerms[6];
    signal sum7 <== sum6 + hashTerms[7];
    signal sum8 <== sum7 + hashTerms[8];
    signal sum9 <== sum8 + hashTerms[9];
    
    hash <== sum9 + salt;
    
    // 2. Check if hash matches any allowed hash
    component eq1 = IsEqual();
    component eq2 = IsEqual();
    component eq3 = IsEqual();
    
    eq1.in[0] <== hash;
    eq1.in[1] <== allowedHashes[0];
    
    eq2.in[0] <== hash;
    eq2.in[1] <== allowedHashes[1];
    
    eq3.in[0] <== hash;
    eq3.in[1] <== allowedHashes[2];
    
    // OR the results
    component or1 = OR();
    component or2 = OR();
    
    or1.a <== eq1.out;
    or1.b <== eq2.out;
    
    or2.a <== or1.out;
    or2.b <== eq3.out;
    
    isValid <== or2.out;
}

component main = SimpleUsernameVerifier();