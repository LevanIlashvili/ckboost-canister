import { useQuery } from "@tanstack/react-query";
import { backend } from "../../backend/declarations";

export default function useGenerateBTCAddress() {
  return useQuery({
    queryKey: ["generateBTCAddress"],
    queryFn: () => backend.getBTCAddress(),
  });
}
