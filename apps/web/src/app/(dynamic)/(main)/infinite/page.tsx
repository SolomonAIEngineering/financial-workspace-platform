import * as React from "react";

import { Client } from "./client";
import { HydrateClient } from "@/trpc/server";
import { dataOptions } from "./query-options";
import { getQueryClient } from "@/providers/get-query-client";
import { searchParamsCache } from "./search-params";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const search = searchParamsCache.parse(await searchParams);
  const queryClient = getQueryClient();
  await queryClient.prefetchInfiniteQuery(dataOptions(search));

  return (
    <HydrateClient>
      <div className="p-[0.5%]">
        <Client />
      </div>
    </HydrateClient>
  );
}
