"use client";
import React, { createContext, useEffect, useRef, useMemo, useContext } from 'react'
import { api } from '~/trpc/react'

interface S3GrantContextValue {
    grants?: {
        id: string;
        key: string;
        team_id: string;
        url: string;
        created_at: Date;
        expired_at: Date;
    }[];
}

const S3GrantContext = createContext<S3GrantContextValue>({});

function S3GrantsProvider({ children }: Readonly<React.PropsWithChildren>) {
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const { data: teams, isLoading: teamsLoading, isError: teamsError } = api.team.readAll.useQuery();

    const slugs = teams?.map((team) => team.uniqueId) ?? [];

    const { data: grants, refetch } = api.s3.ReadMany.useQuery({ slugs })


    useEffect(() => {
        if (!grants || grants.length === 0) return;
        if (teamsLoading || teamsError) return;
        if (timerRef.current) clearTimeout(timerRef.current);

        const soonest = grants.map(g => new Date(g.expired_at).getTime()).filter(t => t > Date.now()).sort((a, b) => a - b)[0];

        if (soonest) {
            const msUntilExpire = soonest - Date.now();

            timerRef.current = setTimeout(() => {
                refetch();
            }, msUntilExpire + 1000);
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        }
    }, [grants, refetch]);

    const contextValue = useMemo(() => {
        return { grants };
    }, [grants]);

    return (
        <S3GrantContext.Provider value={contextValue}>
            {children}
        </S3GrantContext.Provider>
    )
}

export default S3GrantsProvider

export function useS3Grants() {
    return useContext(S3GrantContext);
}