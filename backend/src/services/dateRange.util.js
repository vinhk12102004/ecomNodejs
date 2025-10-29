import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek.js";

dayjs.extend(isoWeek);

export function getDateRange(req) {
  const tr = (req.query.timeRange || "").toLowerCase();
  const now = dayjs();

  if (tr === "today") {
    return {
      start: now.startOf("day").toDate(),
      end: now.endOf("day").toDate(),
    };
  }

  if (tr === "yesterday") {
    const y = now.subtract(1, "day");
    return {
      start: y.startOf("day").toDate(),
      end: y.endOf("day").toDate(),
    };
  }

  if (tr === "thisweek") {
    return {
      start: now.startOf("week").toDate(),
      end: now.endOf("week").toDate(),
    };
  }

  if (tr === "thismonth") {
    return {
      start: now.startOf("month").toDate(),
      end: now.endOf("month").toDate(),
    };
  }

  if (tr === "range") {
    const s = req.query.start ? dayjs(req.query.start) : now.startOf("month");
    const e = req.query.end ? dayjs(req.query.end) : now.endOf("month");
    return {
      start: s.toDate(),
      end: e.toDate(),
    };
  }

  return {
    start: new Date(0),
    end: now.endOf("day").toDate(),
  };
}
