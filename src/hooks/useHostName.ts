import { useState, useEffect } from "react";

function useHostName() {
  const [host, setHost] = useState("");

  // to make sure it'll only run in client
  useEffect(() => {
    if (window) {
      const { location } = window;
      setHost(`${location.protocol}//${location.host}`);
    }
  }, []);

  return host;
}

export { useHostName };
