import AWS from "aws-sdk";
import { configs } from "./index";

export const s3 = new AWS.S3({
  region: configs.api.aws.region!,
  accessKeyId: configs.api.aws.accessKeyId!,
  secretAccessKey: configs.api.aws.secretAccessKey!,
});
