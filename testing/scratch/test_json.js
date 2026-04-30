try {
  const badJson = '{\n  \'reelUrl\': "test"\n}';
  JSON.parse(badJson);
} catch (e) {
  console.log(e.message);
}

try {
  const badJson2 = '{\n  reelUrl: "test"\n}';
  JSON.parse(badJson2);
} catch (e) {
  console.log(e.message);
}
