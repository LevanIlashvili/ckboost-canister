actor {
  public query func greet(name : Text) : async Text {
    return "Hello, " # name # "!";
  };

  public query func getBTCAddress() : async Text {
    return "mkHS9ne12qx9pS9VojpwU5xtRd4T7X7ZUt";
  };
};