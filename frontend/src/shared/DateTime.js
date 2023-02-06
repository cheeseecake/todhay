import React, { useState, useEffect } from "react";
import { format } from "date-fns";

export const DateTime = () => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    let timer = setInterval(() => setDate(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return <div>{format(date, "eeee, d MMM yyyy")}</div>;
};
