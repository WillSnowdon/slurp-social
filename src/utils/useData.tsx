import React, { FunctionComponent, PropsWithChildren } from "react";
import useSWR from "swr";
import { SlurpUser } from "./types";
import { useSocialProtocolGetters } from "./useSocialProtocolGetters";

type AppData = {
  authedUser?: SlurpUser | null;
  shouldCreateUser?: boolean;
  loadingUser?: boolean;
  refreshUser?: () => Promise<SlurpUser | null>;
};

export const DataContext = React.createContext<AppData>({});

export const DataProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const socialProto = useSocialProtocolGetters();
  const auth = useSWR(socialProto ? "authed-user" : null, () =>
    socialProto
      ?.getAuthedUser()
      .then((user) => user && { ...user, publicKey: user.publicKey.toString() })
  );

  return (
    <DataContext.Provider
      value={{
        authedUser: auth.data,
        loadingUser: !auth.data && auth.isLoading,
        shouldCreateUser: !auth.isLoading && auth.data === null,
        refreshUser: async () => {
          if (!socialProto) throw new Error("");
          const user = await socialProto
            .getAuthedUser()
            .then(
              (user) =>
                user && { ...user, publicKey: user.publicKey.toString() }
            );

          auth.mutate(user);

          return user;
        },
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
