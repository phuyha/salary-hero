import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile = require('winston-daily-rotate-file');
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as moment from 'moment';

const BASE_PATH = 'logs';

type TransportConfig = {
  name: string;
};

enum TransportType {
  CONSOLE = 'console',
  FILE = 'file',
}

const hostname = process.env['HOSTNAME'] || 'service';

@Injectable()
export class Logger {
  private readonly config;
  private logger: winston.Logger;
  constructor(private readonly configService: ConfigService) {
    this.config = configService.get('logger');
    this.init();
    this.removeOldLogs();
  }

  private readonly removeOldLogs = async () => {
    try {
      let dirs = await fs.readdir(BASE_PATH);
      dirs = Array.isArray(dirs) ? dirs : [];
      for (const dir of dirs) {
        if (dir === hostname) { // current docker
          continue;
        }

        const path = `${BASE_PATH}/${dir}`;
        const stats = await fs.stat(path);
        if (!stats.mtime) {
          continue;
        }

        const duration = (moment as any).duration((moment as any)().diff(stats.mtime));
        const hours = duration.asHours();
        const fiveDaysInHours = 5 * 24;
        if (hours > fiveDaysInHours) { // only remove docker log folders which are older than 5 days old
          await fs.rm(path, { recursive: true, force: true });
          console.log(`Removed all logs from ${hours} hours old ${path}`);
        }
      }
    } catch (err) {
      console.error(err);
    }
    return Promise.resolve();
  };

  private init() {
    const logLevels = {
      levels: {
        error: 0,
        warn: 1,
        info: 3,
        trace: 4,
        debug: 5,
      },
      colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        trace: 'magenta',
        debug: 'cyan',
      },
    };

    winston.addColors(logLevels.colors);

    this.logger = winston.createLogger({
      level: this.config?.level || 'info',
      levels: logLevels.levels,
      format: winston.format.json(),
    });

    const transports = this.config?.transports || ["console", "file"];
    transports.map((transportConfig: string | TransportConfig) => {
      this.addTransport(transportConfig);
    });
  }

  private addTransport(transportConfig: string | TransportConfig) {
    const transportName =
      typeof transportConfig === 'string'
        ? transportConfig
        : transportConfig.name;

    switch (transportName) {
      case TransportType.CONSOLE:
        this.addConsoleTransport();
        break;
      case TransportType.FILE:
        this.addFileTransport();
        break;
    }
  }

  private addConsoleTransport() {
    this.logger.add(
      new winston.transports.Console({
        format: winston.format.prettyPrint({ depth: 2, colorize: true }),
        silent: false,
      })
    );
  }

  private addFileTransport() {
    this.logger.add(
      new DailyRotateFile({
        filename: `${BASE_PATH}/${hostname}/%DATE%.log`,
        datePattern: 'YYYY-MM-DD-HH',
        zippedArchive: false,
        frequency: this.config?.rotateFileConfig?.frequency || '5m',
        maxSize: this.config?.rotateFileConfig?.maxSize || '50m',
        maxFiles: this.config?.rotateFileConfig?.maxFiles || 10,
        createSymlink: false,
        auditFile: `${BASE_PATH}/${hostname}/audit.txt`
      })
    );
  }

  private readonly logParser = (message: any, ...meta: any[]) => {
    let time_duration = 0;
    let Payload = {};
    const others = [];
    for (const m of meta) {
      if (typeof m === 'object') {
        Payload = { ...Payload, ...m };
        if (m?.time) {
          time_duration = m?.time;
        }
      } else {
        others.push(m);
      }
    }
    return {
      ...time_duration && { time_duration },
      MessageTemplate: Payload,
      message,
      ...others,
      timestamp: new Date().toISOString(),
    };
  };

  public error(message: any, ...meta: any[]) {
    this.logger.error(this.logParser(message, ...meta));
  }

  public warn(message: any, ...meta: any[]) {
    this.logger.warn(this.logParser(message, ...meta));
  }

  public info(message: any, ...meta: any[]) {
    this.logger.info(this.logParser(message, ...meta));
  }

  public debug(message: any, ...meta: any[]) {
    this.logger.debug(this.logParser(message, ...meta));
  }

  public trace(message: any, ...meta: any[]) {
    this.logger.log('trace', this.logParser(message, ...meta));
  }
}
