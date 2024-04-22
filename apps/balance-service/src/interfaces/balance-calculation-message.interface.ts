import { SalaryRateEnum } from "@salary-hero/salary-hero-repository";

export interface BalanceCalculationMessage {
  workerId: number;
  balanceId: number;
  name: string;
  salaryRate: SalaryRateEnum;
  salary: number;
  logId: string;
}

export interface RabbitmqMessagePayload {
  routingKey: string;
  message: BalanceCalculationMessage;
  exchange: string;
  retryTime?: number;
  maxRetry?: number;
  error?: Error;
}