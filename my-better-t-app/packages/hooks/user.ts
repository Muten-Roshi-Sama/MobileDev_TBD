import { orpc } from "@my-better-t-app/web/src/utils/orpc"; // or a shared orpc if you have one




function useCurrentUser() {
    const {data, isLoading, error} = useQuery(orpc.user.getCurrentUserInfo.queryOptions());
    return { user: data, isLoading, error};
}
