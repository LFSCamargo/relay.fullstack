/* eslint-disable relay/unused-fields */
import { graphql, useLazyLoadQuery } from "react-relay";
import type { dashboardQuery } from "./__generated__/dashboardQuery.graphql";
import { Suspense, useEffect } from "react";
import { UserInformationCard } from "@/components/dashboard/UserInformationCard";
import { useAuthStore } from "@/modules/auth/stores";
import { EditUserProfileCard } from "@/components/dashboard/EditUserProfileCard";

export function DashboardScreen() {
  const data = useLazyLoadQuery<dashboardQuery>(
    graphql`
      query dashboardQuery {
        me {
          id
          ...UserInformationCard_user
          ...EditUserProfileCard_user
        }
      }
    `,
    {},
  );

  useEffect(() => {
    const { token } = useAuthStore.getState();

    if (!token) {
      window.location.href = "/auth/login";
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="relative z-20 flex items-center justify-center  mb-4 font-medium">
        Relay and GraphQL Boilerplate
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -52.5 256 256"
          version="1.1"
          preserveAspectRatio="xMidYMid"
          className="ml-2 h-6 w-6"
        >
          <g>
            <path
              d="M208.615113,119.908171 L96.6828809,119.908171 C86.1464977,119.908171 77.5738558,111.336035 77.5738558,100.800664 C77.5738558,90.2622566 86.1454855,81.6896147 96.6828809,81.6896147 L157.811921,81.6896147 C175.652107,81.6896147 190.16456,67.1766553 190.16456,49.3369763 C190.16456,31.4972974 175.652613,16.9828196 157.811921,16.9828196 L47.2233747,16.9828196 C44.1695014,7.14344129 34.994818,0 24.1519938,0 C10.8106997,0 0,10.8106997 0,24.1519938 C0,37.493288 10.8117119,48.3039877 24.1530061,48.3039877 C35.3920217,48.3039877 44.8397929,40.6272255 47.5342949,30.2284573 L47.5342949,30.2284573 L157.812934,30.2284573 C168.347799,30.2284573 176.92044,38.8010992 176.92044,49.3374825 C176.92044,59.8738657 168.348305,68.4465076 157.812934,68.4465076 L96.6838932,68.4465076 C78.8442142,68.4465076 64.3297365,82.9604792 64.3297365,100.800664 C64.3297365,118.640849 78.843202,133.153303 96.6838932,133.153303 L208.614537,133.153303 C211.492318,143.274137 220.802933,150.683743 231.848006,150.683743 C245.1893,150.683743 256,139.873043 256,126.531749 C256,113.190455 245.1893,102.379755 231.848006,102.379755 C220.803669,102.379755 211.49356,109.788373 208.615113,119.908171 Z"
              fill="#F26B00"
            ></path>
          </g>
        </svg>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex flex-col items-start gap-4">
          {!data.me ? null : <UserInformationCard user={data.me} />}
          {!data.me ? null : <EditUserProfileCard user={data.me} />}
        </div>
      </Suspense>
    </div>
  );
}
