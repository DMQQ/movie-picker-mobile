const { withGradleProperties } = require("@expo/config-plugins");

const KEY = "org.gradle.jvmargs";
const VALUE = "-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError";

module.exports = function withGradleMemory(config) {
  return withGradleProperties(config, (config) => {
    config.modResults = config.modResults.filter(
      (item) => !(item.type === "property" && item.key === KEY)
    );
    config.modResults.push({ type: "property", key: KEY, value: VALUE });
    return config;
  });
};
