export interface TimeframeDates {
  start: string;
  end: string;
}

export function getTimeframeDates(
  unit: "week" | "month" | "quarter" | "year",
  offset: number = 0
): TimeframeDates {
  const now = new Date();

  let start: Date;
  let end: Date;

  switch (unit) {
    case "week": {
      const dayOfWeek = now.getDay();
      start = new Date(now);
      start.setDate(now.getDate() - dayOfWeek + offset * 7);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case "month": {
      const targetMonth = now.getMonth() + offset;
      start = new Date(now.getFullYear(), targetMonth, 1);
      end = new Date(now.getFullYear(), targetMonth + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case "quarter": {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const targetQuarter = currentQuarter + offset;
      const targetYear = now.getFullYear() + Math.floor(targetQuarter / 4);
      const adjustedQuarter = ((targetQuarter % 4) + 4) % 4;
      start = new Date(targetYear, adjustedQuarter * 3, 1);
      end = new Date(targetYear, adjustedQuarter * 3 + 3, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case "year": {
      const targetYear = now.getFullYear() + offset;
      start = new Date(targetYear, 0, 1);
      end = new Date(targetYear, 11, 31);
      end.setHours(23, 59, 59, 999);
      break;
    }
  }

  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

export function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}
