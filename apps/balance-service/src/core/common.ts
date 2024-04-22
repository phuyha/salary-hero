export const sleep = (wait = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(1)
    }, wait)
  });
}

export const MONTHLY_BALANCE_CALCULATION_JOB = 'calculate-balance-monthly-worker-job';
export const DAILY_BALANCE_CALCULATION_JOB = 'calculate-balance-daily-worker-job';
export const BALANCE_CALCULATION_QUEUE = 'balance:calculate';