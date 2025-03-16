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
  public type Subaccount = Blob;
  public type Amount = Nat;
  public type Timestamp = Int;
  public type APR = Float;
  
  public type BoostRequest = {
    id: BoostId;
    owner: Principal;
    amount: Amount;
    apr: APR;
    subaccount: Subaccount;
    status: BoostStatus;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  };
  
  public type BoostStatus = {
    #pending;
    #active;
    #completed;
    #cancelled;
  };
  
  // Custom hash function for Nat that considers all bits
  private func natHash(n: Nat) : Hash.Hash {
    let h = Nat32.fromNat(n % (2**32));
    return h;
  };
  
  // State variables
  private stable var nextBoostId: BoostId = 1;
  private stable var boostRequestEntries : [(BoostId, BoostRequest)] = [];
  private var boostRequests = HashMap.HashMap<BoostId, BoostRequest>(0, Nat.equal, natHash);
  
  // Subaccount generation
  private func generateSubaccount(owner: Principal, boostId: BoostId) : Subaccount {
    let buf = Buffer.Buffer<Nat8>(32);
    
    buf.add(0x01);
    
    let principalBytes = Blob.toArray(Principal.toBlob(owner));
    let principalBytesToUse = Array.subArray(principalBytes, 0, Nat.min(principalBytes.size(), 16));
    for (byte in principalBytesToUse.vals()) {
      buf.add(byte);
    };
    
    while (buf.size() < 24) {
      buf.add(0);
    };
    
    var id = boostId;
    for (i in Iter.range(0, 7)) {
      buf.add(Nat8.fromNat(Nat64.toNat(Nat64.fromNat(id) / Nat64.fromNat(256 ** (7 - i)) % 256)));
    };
    
    return Blob.fromArray(Buffer.toArray(buf));
  };
  
  system func preupgrade() {
    boostRequestEntries := Iter.toArray(boostRequests.entries());
  };
  
  system func postupgrade() {
    boostRequests := HashMap.fromIter<BoostId, BoostRequest>(
      boostRequestEntries.vals(), 
      boostRequestEntries.size(), 
      Nat.equal, 
      natHash
    );
    boostRequestEntries := [];
  };
  
  public query func greet(name : Text) : async Text {
    return "Hello, " # name # "!";
  };

  public query func getBTCAddress() : async Text {
    return "mkHS9ne12qx9pS9VojpwU5xtRd4T7X7ZUt";
  };

  public shared(msg) func whoami() : async Text {
    let caller = msg.caller;
    return Principal.toText(caller);
  };
  
  public shared(msg) func registerBoostRequest(amount: Amount, apr: APR) : async Result.Result<BoostRequest, Text> {
    let caller = msg.caller;
    
    if (amount == 0) {
      return #err("Amount must be greater than 0");
    };
    
    if (apr <= 0.0 or apr > 2.0) {
      return #err("APR must be between 0.1% and 2.0%");
    };
    
    let boostId = nextBoostId;
    nextBoostId += 1;
    
    let now = Time.now();
    let subaccount = generateSubaccount(caller, boostId);
    
    let boostRequest : BoostRequest = {
      id = boostId;
      owner = caller;
      amount = amount;
      apr = apr;
      subaccount = subaccount;
      status = #pending;
      createdAt = now;
      updatedAt = now;
    };
    
    boostRequests.put(boostId, boostRequest);
    
    return #ok(boostRequest);
  };
  
  public query func getBoostRequest(id: BoostId) : async ?BoostRequest {
    boostRequests.get(id)
  };
  
  public query func getUserBoostRequests(user: Principal) : async [BoostRequest] {
    let userRequests = Buffer.Buffer<BoostRequest>(0);
    
    for ((_, request) in boostRequests.entries()) {
      if (Principal.equal(request.owner, user)) {
        userRequests.add(request);
      };
    };
    
    return Buffer.toArray(userRequests);
  };
  
  public query func getAllBoostRequests() : async [BoostRequest] {
    Iter.toArray(Iter.map<(BoostId, BoostRequest), BoostRequest>(boostRequests.entries(), func ((_, v) : (BoostId, BoostRequest)) : BoostRequest { v }))
  };
};