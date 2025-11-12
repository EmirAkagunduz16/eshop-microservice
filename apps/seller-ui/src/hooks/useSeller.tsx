import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../app/utils/axiosInstance";

// fetch seller data hook
const fetchSeller = async () => {
  const repsonse = await axiosInstance.get("/api/logged-in-seller");

  return repsonse.data.seller;
};

const useSeller = () => {
  const {
    data: seller,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["seller"],
    queryFn: fetchSeller,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return { seller, isLoading, isError, refetch };
};

export default useSeller;
