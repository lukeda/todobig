import { useEffect, useState } from "react";
import { Select } from "@mantine/core";
import { invoke } from "@tauri-apps/api/core";
import { MonitorInfo } from "../types";

export function MonitorSelector() {
  const [monitors, setMonitors] = useState<MonitorInfo[]>([]);
  const [preferredMonitor, setPreferredMonitor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMonitors() {
      try {
        const monitorList = await invoke<MonitorInfo[]>("get_monitors");
        setMonitors(monitorList);
        
        const current = await invoke<string | null>("get_preferred_monitor");
        setPreferredMonitor(current);
      } catch (error) {
        console.error("Failed to load monitors:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadMonitors();
  }, []);

  const handleChange = async (value: string | null) => {
    try {
      await invoke("set_preferred_monitor", { monitorName: value });
      setPreferredMonitor(value);
    } catch (error) {
      console.error("Failed to set preferred monitor:", error);
    }
  };

  const monitorOptions = [
    { value: "", label: "Auto (cursor position)" },
    ...monitors.map((m) => ({
      value: m.name || `monitor-${m.position[0]}-${m.position[1]}`,
      label: `${m.name || "Unknown"}${m.is_primary ? " (Primary)" : ""}`,
    })),
  ];

  return (
    <Select
      label="Preferred Monitor"
      description="Select which monitor the panel should open on"
      data={monitorOptions}
      value={preferredMonitor || ""}
      onChange={handleChange}
      disabled={loading}
      placeholder={loading ? "Loading monitors..." : "Select monitor"}
      clearable
    />
  );
}