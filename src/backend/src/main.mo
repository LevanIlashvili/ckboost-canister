import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Float "mo:base/Float";
import Hash "mo:base/Hash";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Int64 "mo:base/Int64";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Option "mo:base/Option";
import Random "mo:base/Random";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import TrieMap "mo:base/TrieMap";

actor CKBoost {
  // ckBTC Minter Interface
  type Account = {
    owner : Principal;
    subaccount : ?Blob;
  };

  type BtcNetwork = {
    #mainnet;
    #testnet;
  };

  type MinterInfo = {
    btc_network : BtcNetwork;
    min_confirmations : Nat32;
    retrieve_btc_min_amount : Nat64;
    kyt_fee : Nat64;
  };

  type RetrieveBtcStatus = {
    #Unknown;
    #Pending;
    #Sending;
    #Submitted : { txid : Text };
    #Confirmed : { txid : Text };
    #AmountTooLow;
    #Expired;
  };

  type RetrieveBtcError = {
    #MalformedAddress : Text;
    #InsufficientFunds : { balance : Nat64 };
    #AmountTooLow : { min_amount : Nat64 };
    #InsufficientAllowance : { allowance : Nat64 };
  };

  type RetrieveBtcOk = {
    block_index : Nat64;
  };

  type RetrieveBtcResult = {
    #Ok : RetrieveBtcOk;
    #Err : RetrieveBtcError;
  };

  type UpdateBalanceError = {
    #GenericError : { error_message : Text; error_code : Nat64 };
    #TemporarilyUnavailable : Text;
    #AlreadyProcessing;
    #NoNewUtxos : { required_confirmations : Nat32; current_confirmations : ?Nat32 };
  };

  type Utxo = {
    height : Nat32;
    value : Nat64;
    outpoint : { txid : Blob; vout : Nat32 };
  };

  type UpdateBalanceOk = {
    block_index : Nat64;
    amount : Nat64;
    utxos : [Utxo];
  };

  type UpdateBalanceResult = {
    #Ok : UpdateBalanceOk;
    #Err : UpdateBalanceError;
  };

  type CkBtcMinterInterface = actor {
    get_btc_address : shared ({owner: ?Principal; subaccount: ?Blob}) -> async Text;
    update_balance : shared ({owner: ?Principal; subaccount: ?Blob}) -> async UpdateBalanceResult;
    get_minter_info : shared query () -> async MinterInfo;
    retrieve_btc : shared (address : Text, amount : Nat64) -> async RetrieveBtcResult;
    retrieve_btc_status : shared query (block_index : Nat64) -> async RetrieveBtcStatus;
  };

  // Constants
  let CKBTC_MINTER_CANISTER_ID : Text = "mqygn-kiaaa-aaaar-qaadq-cai"; // Mainnet ckBTC Minter
  let ckBTCMinter : CkBtcMinterInterface = actor(CKBTC_MINTER_CANISTER_ID);

  let CANISTER_PRINCIPAL: Text = "75egi-7qaaa-aaaao-qj6ma-cai";  
  
  // Types
  public type BoostId = Nat;
  public type BoosterPoolId = Nat;
  public type Subaccount = Blob;
  
  public type Amount = Nat;
  public type Timestamp = Int;
  public type Fee = Float; // Fee percentage
  
  public type BoostStatus = {
    #pending;
    #active;
    #completed;
    #cancelled;
  };
  
  public type BoosterPool = {
    id: BoosterPoolId;
    owner: Principal;
    fee: Fee; // Fee percentage that the booster takes
    subaccount: Subaccount;
    availableAmount: Amount; // Amount available for boosting
    totalBoosted: Amount; // Total amount currently being boosted
    createdAt: Timestamp;
    updatedAt: Timestamp;
  };
  
  public type BoostRequest = {
    id: BoostId;
    owner: Principal;
    amount: Amount; // Amount in satoshis (1 ckBTC = 100,000,000 satoshis)
    fee: Fee; // Fee percentage the user is willing to pay
    receivedBTC: Amount; // Actual amount of BTC received at the generated address
    btcAddress: ?Text; // BTC address generated for this request
    subaccount: Subaccount;
    status: BoostStatus;
    matchedBoosterPool: ?BoosterPoolId; // ID of the booster pool that fulfilled this request
    createdAt: Timestamp;
    updatedAt: Timestamp;
  };
  
  private func natHash(n: Nat) : Hash.Hash {
    let h = Nat32.fromNat(n % (2**32));
    return h;
  };
  
  // State variables
  private stable var nextBoostId: BoostId = 1;
  private stable var nextBoosterPoolId: BoosterPoolId = 1;
  private stable var boostRequestEntries : [(BoostId, BoostRequest)] = [];
  private stable var boosterPoolEntries : [(BoosterPoolId, BoosterPool)] = [];
  
  private var boostRequests = HashMap.HashMap<BoostId, BoostRequest>(0, Nat.equal, natHash);
  private var boosterPools = HashMap.HashMap<BoosterPoolId, BoosterPool>(0, Nat.equal, natHash);
  
  // Subaccount generation for boost requests
  private func generateSubaccount(owner: Principal, id: Nat) : Subaccount {
    let buf = Buffer.Buffer<Nat8>(32);
    
    buf.add(0x01); // Prefix for boost request subaccounts
    
    let principalBytes = Blob.toArray(Principal.toBlob(owner));
    let principalBytesToUse = Array.subArray(principalBytes, 0, Nat.min(principalBytes.size(), 16));
    for (byte in principalBytesToUse.vals()) {
      buf.add(byte);
    };
    
    while (buf.size() < 24) {
      buf.add(0);
    };
    
    var idNat = id;
    for (i in Iter.range(0, 7)) {
      buf.add(Nat8.fromNat(Nat64.toNat(Nat64.fromNat(idNat) / Nat64.fromNat(256 ** (7 - i)) % 256)));
    };
    
    return Blob.fromArray(Buffer.toArray(buf));
  };
  
  // Subaccount generation for booster pools
  private func generateBoosterPoolSubaccount(owner: Principal, poolId: BoosterPoolId) : Subaccount {
    let buf = Buffer.Buffer<Nat8>(32);
    
    buf.add(0x02);
    
    let principalBytes = Blob.toArray(Principal.toBlob(owner));
    let principalBytesToUse = Array.subArray(principalBytes, 0, Nat.min(principalBytes.size(), 16));
    for (byte in principalBytesToUse.vals()) {
      buf.add(byte);
    };
    
    while (buf.size() < 24) {
      buf.add(0);
    };
    
    var id = poolId;
    for (i in Iter.range(0, 7)) {
      buf.add(Nat8.fromNat(Nat64.toNat(Nat64.fromNat(id) / Nat64.fromNat(256 ** (7 - i)) % 256)));
    };
    
    return Blob.fromArray(Buffer.toArray(buf));
  };
  
  // Helper function to convert ckBTC to satoshis
  public func ckBTCToSatoshis(ckBTC: Float) : async Amount {
    let int64Value = Float.toInt64(ckBTC * 100_000_000);
    // Convert Int64 to Nat using a safe approach
    return if (int64Value >= 0) {
      Nat64.toNat(Int64.toNat64(int64Value))
    } else {
      0 // Return 0 if negative (shouldn't happen with proper inputs)
    };
  };
  
  public func satoshisToCkBTC(satoshis: Amount) : async Float {
    return Float.fromInt(satoshis) / 100_000_000;
  };
  
  system func preupgrade() {
    boostRequestEntries := Iter.toArray(boostRequests.entries());
    boosterPoolEntries := Iter.toArray(boosterPools.entries());
  };
  
  system func postupgrade() {
    boostRequests := HashMap.fromIter<BoostId, BoostRequest>(
      boostRequestEntries.vals(), 
      boostRequestEntries.size(), 
      Nat.equal, 
      natHash
    );
    boostRequestEntries := [];
    
    boosterPools := HashMap.fromIter<BoosterPoolId, BoosterPool>(
      boosterPoolEntries.vals(), 
      boosterPoolEntries.size(), 
      Nat.equal, 
      natHash
    );
    boosterPoolEntries := [];
  };
  
  public query func greet(name : Text) : async Text {
    return "Hello, " # name # "!";
  };

  public shared(msg) func whoami() : async Text {
    let caller = msg.caller;
    return Principal.toText(caller);
  };
  
  // Get a BTC address for a boost request from the ckBTC minter
  private func getBTCAddress(subaccount: Blob) : async Text {
    try {
      let canisterPrincipal = Principal.fromText(CANISTER_PRINCIPAL);
      
      Debug.print("Calling ckBTC minter with principal: " # Principal.toText(canisterPrincipal));
      
      // Create the record structure exactly as expected by the minter
      // The signature is: get_btc_address: (record {owner:opt principal; subaccount:opt vec nat8}) → (text)
      let args = {
        owner = ?canisterPrincipal;
        subaccount = ?subaccount;  // Now we're using the provided subaccount
      };
      
      let btcAddress = await ckBTCMinter.get_btc_address(args);
      
      Debug.print("Successfully got BTC address: " # btcAddress);
      return btcAddress;
    } catch (e) {
      Debug.print("Error in getBTCAddress: " # Error.message(e));
      throw Error.reject("Error getting BTC address: " # Error.message(e));
    };
  };
  
  // Check for BTC deposits to a specific address
  public func checkBTCDeposit(boostId: BoostId) : async Result.Result<BoostRequest, Text> {
    switch (boostRequests.get(boostId)) {
      case (null) {
        return #err("Boost request not found");
      };
      case (?request) {
        try {
          // Use this canister's principal as the owner, and the request's subaccount
          let canisterPrincipal = Principal.fromText(CANISTER_PRINCIPAL);
          
          Debug.print("Checking BTC deposits for boost request " # Nat.toText(boostId));
          
          // Create the record structure exactly as expected by the minter
          // The signature is: update_balance: (record {owner:opt principal; subaccount:opt vec nat8}) → (UpdateBalanceResult)
          let args = {
            owner = ?canisterPrincipal;
            subaccount = ?request.subaccount;  // Now we're using the request's subaccount
          };
          
          let updateResult = await ckBTCMinter.update_balance(args);
          
          switch (updateResult) {
            case (#Ok(result)) {
              Debug.print("Found deposits: " # Nat64.toText(result.amount) # " satoshis");
              // Update the received BTC amount
              let updatedRequest = await updateReceivedBTC(boostId, Nat64.toNat(result.amount));
              return updatedRequest;
            };
            case (#Err(error)) {
              switch (error) {
                case (#NoNewUtxos(_)) {
                  Debug.print("No new deposits detected for boost request " # Nat.toText(boostId));
                  return #err("No new deposits detected");
                };
                case (#AlreadyProcessing) {
                  return #err("Already processing deposits");
                };
                case (#TemporarilyUnavailable(msg)) {
                  return #err("Service temporarily unavailable: " # msg);
                };
                case (#GenericError({ error_message; error_code })) {
                  return #err("Error checking deposits: " # error_message);
                };
              };
            };
          };
        } catch (e) {
          Debug.print("Error checking deposits: " # Error.message(e));
          return #err("Error checking deposits: " # Error.message(e));
        };
      };
    };
  };
  
  // Register a new boost request -  Amount is in satoshis (1 ckBTC = 100,000,000 satoshis)
  public shared(msg) func registerBoostRequest(amount: Amount, fee: Fee) : async Result.Result<BoostRequest, Text> {
    let caller = msg.caller;
    
    if (amount == 0) {
      return #err("Amount must be greater than 0");
    };
    
    if (fee < 0.0 or fee > 1.0) {
      return #err("Fee must be between 0% and 100%");
    };
    
    let boostId = nextBoostId;
    nextBoostId += 1;
    
    let now = Time.now();
    let subaccount = generateSubaccount(caller, boostId);
    
    // Create the initial boost request without BTC address
    let initialBoostRequest : BoostRequest = {
      id = boostId;
      owner = caller;
      amount = amount;
      fee = fee;
      receivedBTC = 0; // Initially no BTC received
      btcAddress = null; // BTC address will be set later
      subaccount = subaccount;
      status = #pending;
      matchedBoosterPool = null;
      createdAt = now;
      updatedAt = now;
    };
    
    boostRequests.put(boostId, initialBoostRequest);
    
    // Get BTC address from ckBTC minter
    try {
      Debug.print("Getting BTC address for boost request " # Nat.toText(boostId));
      let btcAddress = await getBTCAddress(subaccount);
      Debug.print("Got BTC address: " # btcAddress);
      
      // Update the boost request with the BTC address
      let updatedRequest = await updateBTCAddress(boostId, btcAddress);
      
      // Note: Result variants in Motoko are case-sensitive
      // The updateBTCAddress function returns #ok and #err (lowercase)
      switch (updatedRequest) {
        case (#ok(request)) {
          Debug.print("Successfully updated boost request with BTC address");
          return #ok(request);
        };
        case (#err(error)) {
          Debug.print("Error updating boost request with BTC address: " # error);
          return #err(error);
        };
      };
    } catch (e) {
      // Return the initial boost request even if we couldn't get a BTC address
      // The address can be fetched later
      Debug.print("Error getting BTC address during registration: " # Error.message(e));
      return #ok(initialBoostRequest);
    };
  };
  
  // Update received BTC amount for a boost request
  public func updateReceivedBTC(boostId: BoostId, receivedAmount: Amount) : async Result.Result<BoostRequest, Text> {
    switch (boostRequests.get(boostId)) {
      case (null) {
        return #err("Boost request not found");
      };
      case (?request) {
        let updatedRequest : BoostRequest = {
          id = request.id;
          owner = request.owner;
          amount = request.amount;
          fee = request.fee;
          receivedBTC = receivedAmount;
          btcAddress = request.btcAddress;
          subaccount = request.subaccount;
          status = request.status;
          matchedBoosterPool = request.matchedBoosterPool;
          createdAt = request.createdAt;
          updatedAt = Time.now();
        };
        
        boostRequests.put(boostId, updatedRequest);
        return #ok(updatedRequest);
      };
    };
  };
  
  // Update BTC address for a boost request
  private func updateBTCAddress(boostId: BoostId, btcAddress: Text) : async Result.Result<BoostRequest, Text> {
    Debug.print("Updating BTC address for boost request " # Nat.toText(boostId) # " to " # btcAddress);
    
    switch (boostRequests.get(boostId)) {
      case (null) {
        Debug.print("Boost request not found: " # Nat.toText(boostId));
        return #err("Boost request not found");
      };
      case (?request) {
        let updatedRequest : BoostRequest = {
          id = request.id;
          owner = request.owner;
          amount = request.amount;
          fee = request.fee;
          receivedBTC = request.receivedBTC;
          btcAddress = ?btcAddress;
          subaccount = request.subaccount;
          status = request.status;
          matchedBoosterPool = request.matchedBoosterPool;
          createdAt = request.createdAt;
          updatedAt = Time.now();
        };
        
        boostRequests.put(boostId, updatedRequest);
        Debug.print("Successfully updated boost request with BTC address");
        return #ok(updatedRequest);
      };
    };
  };
  
  // Get BTC address for an existing boost request
  public func getBoostRequestBTCAddress(boostId: BoostId) : async Result.Result<Text, Text> {
    switch (boostRequests.get(boostId)) {
      case (null) {
        return #err("Boost request not found");
      };
      case (?request) {
        switch (request.btcAddress) {
          case (null) {
            // If the BTC address is not set, get it from the ckBTC minter
            try {
              let btcAddress = await getBTCAddress(request.subaccount);
              
              // Update the boost request with the BTC address
              ignore await updateBTCAddress(boostId, btcAddress);
              
              return #ok(btcAddress);
            } catch (e) {
              return #err(Error.message(e));
            };
          };
          case (?address) {
            return #ok(address);
          };
        };
      };
    };
  };
  
  // Register a new booster pool
  public shared(msg) func registerBoosterPool(fee: Fee) : async Result.Result<BoosterPool, Text> {
    let caller = msg.caller;
    
    if (fee < 0.0 or fee > 2.0) {
      return #err("Fee must be between 0% and 2%");
    };
    
    let poolId = nextBoosterPoolId;
    nextBoosterPoolId += 1;
    
    let now = Time.now();
    let subaccount = generateBoosterPoolSubaccount(caller, poolId);
    
    let boosterPool : BoosterPool = {
      id = poolId;
      owner = caller;
      fee = fee;
      subaccount = subaccount;
      availableAmount = 0; // Initially empty
      totalBoosted = 0;
      createdAt = now;
      updatedAt = now;
    };
    
    boosterPools.put(poolId, boosterPool);
    
    return #ok(boosterPool);
  };
  

  // Get a boost request by ID
  public query func getBoostRequest(id: BoostId) : async ?BoostRequest {
    boostRequests.get(id)
  };
  
  // Get all boost requests for a user
  public query func getUserBoostRequests(user: Principal) : async [BoostRequest] {
    let userRequests = Buffer.Buffer<BoostRequest>(0);
    
    for ((_, request) in boostRequests.entries()) {
      if (Principal.equal(request.owner, user)) {
        userRequests.add(request);
      };
    };
    
    return Buffer.toArray(userRequests);
  };
  
  // Get all boost requests
  public query func getAllBoostRequests() : async [BoostRequest] {
    Iter.toArray(Iter.map<(BoostId, BoostRequest), BoostRequest>(boostRequests.entries(), func ((_, v) : (BoostId, BoostRequest)) : BoostRequest { v }))
  };
  
  // Get a booster pool by ID
  public query func getBoosterPool(id: BoosterPoolId) : async ?BoosterPool {
    boosterPools.get(id)
  };
  
  // Get all booster pools for a user
  public query func getUserBoosterPools(user: Principal) : async [BoosterPool] {
    let userPools = Buffer.Buffer<BoosterPool>(0);
    
    for ((_, pool) in boosterPools.entries()) {
      if (Principal.equal(pool.owner, user)) {
        userPools.add(pool);
      };
    };
    
    return Buffer.toArray(userPools);
  };
  
  // Get all booster pools
  public query func getAllBoosterPools() : async [BoosterPool] {
    Iter.toArray(Iter.map<(BoosterPoolId, BoosterPool), BoosterPool>(boosterPools.entries(), func ((_, v) : (BoosterPoolId, BoosterPool)) : BoosterPool { v }))
  };

  public query func getCanisterPrincipal() : async Text {
    return CANISTER_PRINCIPAL;
  };

  // Direct method to get a BTC address for testing
  public func getDirectBTCAddress() : async Text {
    let canisterPrincipal = Principal.fromText(CANISTER_PRINCIPAL);
    
    Debug.print("Directly calling ckBTC minter with principal: " # Principal.toText(canisterPrincipal));
    
    // Create the record structure exactly as expected by the minter
    // The signature is: get_btc_address: (record {owner:opt principal; subaccount:opt vec nat8}) → (text)
    let args = {
      owner = ?canisterPrincipal;
      subaccount = null;
    };
    
    let btcAddress = await ckBTCMinter.get_btc_address(args);
    
    Debug.print("Successfully got direct BTC address: " # btcAddress);
    return btcAddress;
  };
};