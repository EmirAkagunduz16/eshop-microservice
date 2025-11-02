import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";

// fetch user data hook
const fetchUser = async () => {
  const repsonse = await axiosInstance.get("/api/logged-in-user");

  return repsonse.data.user;
};

const useUser = () => {
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 100 * 60 * 5,
    retry: 1,
  });

  return { user, isLoading, isError, refetch };
};

export default useUser;
