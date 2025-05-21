import { ConfigService } from '@nestjs/config';

export enum AppEnv {
  Production = 'production',
  Development = 'development',
  Test = 'test',
}

export const CONFIG_KEYS = {
  NODE_ENV: 'NODE_ENV',
};

export function getAppEnv(configService: ConfigService): AppEnv {
  return configService.get<AppEnv>(CONFIG_KEYS.NODE_ENV) as AppEnv;
}

export function isProdEnv(configService: ConfigService): boolean {
  return getAppEnv(configService) === AppEnv.Production;
}

export function isDevEnv(configService: ConfigService): boolean {
  return getAppEnv(configService) === AppEnv.Development;
}

export function isTestEnv(configService: ConfigService): boolean {
  return getAppEnv(configService) === AppEnv.Test;
}
