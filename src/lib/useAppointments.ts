import { useQuery } from "@tanstack/react-query";

// Example API fetcher function
async function fetchAppointments() {
  const response = await fetch("/api/appointments");
  if (!response.ok) {
    throw new Error("Failed to fetch appointments");
  }
  return response.json();
}

export function useAppointments() {
  return useQuery({
    queryKey: ["appointments"],
    queryFn: fetchAppointments,
  });
}