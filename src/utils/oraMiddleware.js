import chalk from "chalk";
import filesize from "filesize";
import onFinished from "on-finished";
import ora from "ora";

const formatResponseTime = (startTime, endTime) => {
  const ms =
    (endTime[0] - startTime[0]) * 1e3 + (endTime[1] - startTime[1]) * 1e-6;
  const formattedMs = `${ms.toFixed(3)} ms`;
  if (ms >= 1000) {
    return chalk.red(formattedMs);
  }
  if (ms >= 500) {
    return chalk.yellow(formattedMs);
  }
  return chalk.green(formattedMs);
};

const formatStatusCode = statusCode => {
  if (statusCode >= 500) {
    return chalk.red(statusCode);
  }
  if (statusCode >= 400) {
    return chalk.yellow(statusCode);
  }
  if (statusCode >= 300) {
    return chalk.cyan(statusCode);
  }
  if (statusCode >= 200) {
    return chalk.green(statusCode);
  }
  return chalk.grey(statusCode);
};

function formatContentLength(contentLength) {
  const formattedContentLength = filesize(contentLength);
  if (contentLength >= 1024 * 1024) {
    return chalk.red(formattedContentLength);
  }
  if (contentLength >= 512 * 1024) {
    return chalk.yellow(formattedContentLength);
  }
  return chalk.green(formattedContentLength);
}

export const oraMiddleware = (req, res, next) => {
  const prefix = `${chalk.bold(req.method)} ${chalk.gray(req.url)}`;
  const spinner = ora(prefix).start();
  const startTime = process.hrtime();
  onFinished(res, err => {
    const statusCode = formatStatusCode(res.statusCode);

    const endTime = process.hrtime();
    const responseTime = formatResponseTime(startTime, endTime);

    const contentLength = formatContentLength(
      parseInt(res.getHeader("Content-Length") || 0, 10)
    );

    const message = `${prefix} ${statusCode} (${responseTime}) (${contentLength})`;
    return err || res.statusCode >= 500
      ? spinner.fail(message)
      : spinner.succeed(message);
  });
  next();
};
