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
    staleTime: 100 * 60 * 5,
    retry: 1,
  });

  return { seller, isLoading, isError, refetch };
};

export default useSeller;
