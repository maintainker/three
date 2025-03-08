function test() {
  console.log("app inner");
  return "app return";
}

console.log("app outer");

export default test;
