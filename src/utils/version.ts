import path from "path";
import { readFileSync } from "fs";

export const getAppVersion = (): string => {
  const pkgPath = path.join(__dirname, "../../package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  return pkg.version || "desconocida";
};
