import Principal "mo:base/Principal";

actor {
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
};