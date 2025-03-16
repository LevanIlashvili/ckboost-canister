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
    
    let boostRequest : BoostRequest = {
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
    
    boostRequests.put(boostId, boostRequest);
    
    return #ok(boostRequest);
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
          receivedBTC = request.receivedBTC;
          btcAddress = ?btcAddress;
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
  
  // Register a new booster pool
  public shared(msg) func registerBoosterPool(fee: Fee) : async Result.Result<BoosterPool, Text> {
    let caller = msg.caller;
    
    if (fee < 0.0 or fee > 1.0) {
      return #err("Fee must be between 0% and 100%");
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
};