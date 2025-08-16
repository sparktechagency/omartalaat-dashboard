import React, { useContext, useEffect, useState } from "react";
export const UserContext = React.createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const profile = {
    firstName: "Test",
    lastName: "User",
    email: "mithilakhan082@gmail.com",
    mobileNumber: "01812038369",
    location: "Dhaka, Bangladesh",
    image:
      "https://avatars.design/wp-content/uploads/2021/02/corporate-avatars-TN-1.jpg",
  };

  useEffect(() => {
    if (profile && !user) {
     
      setUser(profile);
    }
  }, [profile, user]); 

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
