import * as React from "react";

import { Client } from "./client";
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
    <div className="h-full w-full p-[0.5%]">
      <Client />
    </div>
  );
}
