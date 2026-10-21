import { createContext, useEffect, useState } from "react";
import axiosInstance from "../utils/axiosinstance";
import { API_PATHS } from "../utils/apiPaths";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  useEffect(() => {
    if (user) return;

    const accessToken = localStorage.getItem("token");
    if (!accessToken) {
      setLoadingUser(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        setUser(response.data);
      } catch (error) {
        console.error("User is not Authnticated", error);
        clearUser();
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser()
  }, []);

  const clearUser=()=>{
    setUser(null)
    localStorage.removeItem("token")
    setLoadingUser(false)

  }
  const updateUser=(userData)=>{
    setUser(userData);
    localStorage.setItem("token",userData.token)
    setLoadingUser(false)


  }

  return(
    <UserContext.Provider value={{loadingUser,user,clearUser,updateUser} }>
        {children}
    </UserContext.Provider>
  )
};

export default UserProvider;